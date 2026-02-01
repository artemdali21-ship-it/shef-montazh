import {
  canTransition,
  transition,
  getAvailableTransitions,
  isFinalStatus,
  type TransitionContext,
  type ShiftStatus
} from '@/lib/shift/stateMachine'

describe('Shift State Machine', () => {
  const baseContext: TransitionContext = {
    actorId: 'client-1',
    actorRole: 'client',
    shift: {
      id: 'shift-1',
      status: 'draft',
      client_id: 'client-1',
      start_time: new Date(Date.now() + 3 * 60 * 60 * 1000), // +3 hours
      assigned_workers: [],
      total_amount: 8000
    }
  }

  describe('draft → open', () => {
    it('should allow client to publish draft', () => {
      const can = canTransition('draft', 'open', baseContext)
      expect(can).toBe(true)
    })

    it('should not allow if start time is less than 2 hours away', () => {
      const context = {
        ...baseContext,
        shift: {
          ...baseContext.shift,
          start_time: new Date(Date.now() + 1 * 60 * 60 * 1000) // +1 hour
        }
      }
      const can = canTransition('draft', 'open', context)
      expect(can).toBe(false)
    })

    it('should not allow worker to publish', () => {
      const context = { ...baseContext, actorRole: 'worker' as const }
      const can = canTransition('draft', 'open', context)
      expect(can).toBe(false)
    })

    it('should create hold_payment effect', () => {
      const result = transition('open', baseContext)
      expect(result.success).toBe(true)
      expect(result.effects).toContainEqual({ type: 'hold_payment' })
    })
  })

  describe('draft → cancelled', () => {
    it('should allow client to cancel draft', () => {
      const can = canTransition('draft', 'cancelled', baseContext)
      expect(can).toBe(true)
    })

    it('should have no effects for draft cancellation', () => {
      const result = transition('cancelled', baseContext)
      expect(result.success).toBe(true)
      expect(result.effects).toEqual([])
    })
  })

  describe('open → in_progress', () => {
    const openContext: TransitionContext = {
      ...baseContext,
      actorRole: 'system',
      shift: {
        ...baseContext.shift,
        status: 'open',
        assigned_workers: [
          { id: 'worker-1', checked_in: true }
        ]
      }
    }

    it('should allow system to start shift when worker checked in', () => {
      const can = canTransition('open', 'in_progress', openContext)
      expect(can).toBe(true)
    })

    it('should not allow if no workers checked in', () => {
      const context = {
        ...openContext,
        shift: {
          ...openContext.shift,
          assigned_workers: [{ id: 'worker-1', checked_in: false }]
        }
      }
      const can = canTransition('open', 'in_progress', context)
      expect(can).toBe(false)
    })

    it('should lock applications', () => {
      const result = transition('in_progress', openContext)
      expect(result.success).toBe(true)
      expect(result.effects).toContainEqual({ type: 'lock_applications' })
    })
  })

  describe('open → cancelled (cancellation policy)', () => {
    describe('cancellation >24 hours before', () => {
      const context: TransitionContext = {
        ...baseContext,
        shift: {
          ...baseContext.shift,
          status: 'open',
          start_time: new Date(Date.now() + 25 * 60 * 60 * 1000) // +25 hours
        }
      }

      it('should allow client to cancel', () => {
        const can = canTransition('open', 'cancelled', context)
        expect(can).toBe(true)
      })

      it('should refund 100% (no trust event)', () => {
        const result = transition('cancelled', context)
        expect(result.success).toBe(true)

        const refundEffect = result.effects?.find(e => e.type === 'refund_payment')
        expect(refundEffect).toBeDefined()
        expect((refundEffect as any).amount).toBe(8000 * 1.0) // Full refund >24h

        const trustEvent = result.effects?.find(e => e.type === 'create_trust_event')
        expect(trustEvent).toBeUndefined()
      })
    })

    describe('cancellation 12-24 hours before', () => {
      const context: TransitionContext = {
        ...baseContext,
        shift: {
          ...baseContext.shift,
          status: 'open',
          start_time: new Date(Date.now() + 18 * 60 * 60 * 1000) // +18 hours
        }
      }

      it('should refund 90% (no trust event)', () => {
        const result = transition('cancelled', context)
        const refundEffect = result.effects?.find(e => e.type === 'refund_payment')
        expect((refundEffect as any).amount).toBe(8000 * 0.9)
      })
    })

    describe('cancellation 2-12 hours before', () => {
      const context: TransitionContext = {
        ...baseContext,
        shift: {
          ...baseContext.shift,
          status: 'open',
          start_time: new Date(Date.now() + 6 * 60 * 60 * 1000) // +6 hours
        }
      }

      it('should refund 70% and create medium trust event', () => {
        const result = transition('cancelled', context)

        const refundEffect = result.effects?.find(e => e.type === 'refund_payment')
        expect((refundEffect as any).amount).toBe(8000 * 0.7)

        const trustEvent = result.effects?.find(e => e.type === 'create_trust_event')
        expect(trustEvent).toBeDefined()
        expect((trustEvent as any).severity).toBe('medium')
      })
    })

    describe('cancellation <2 hours before', () => {
      const context: TransitionContext = {
        ...baseContext,
        shift: {
          ...baseContext.shift,
          status: 'open',
          start_time: new Date(Date.now() + 1 * 60 * 60 * 1000) // +1 hour
        }
      }

      it('should not allow client to cancel', () => {
        const can = canTransition('open', 'cancelled', context)
        expect(can).toBe(false)
      })

      it('should allow admin to cancel', () => {
        const adminContext = { ...context, actorRole: 'admin' as const }
        const can = canTransition('open', 'cancelled', adminContext)
        expect(can).toBe(true)
      })

      it('should refund 50% and create high trust event', () => {
        const adminContext = { ...context, actorRole: 'admin' as const }
        const result = transition('cancelled', adminContext)

        const refundEffect = result.effects?.find(e => e.type === 'refund_payment')
        expect((refundEffect as any).amount).toBe(8000 * 0.5)

        const trustEvent = result.effects?.find(e => e.type === 'create_trust_event')
        expect((trustEvent as any).severity).toBe('high')
      })
    })
  })

  describe('in_progress → completed', () => {
    const inProgressContext: TransitionContext = {
      ...baseContext,
      actorRole: 'system',
      shift: {
        ...baseContext.shift,
        status: 'in_progress',
        assigned_workers: [
          { id: 'worker-1', checked_in: true },
          { id: 'worker-2', checked_in: true }
        ]
      }
    }

    it('should allow system to complete shift', () => {
      const can = canTransition('in_progress', 'completed', inProgressContext)
      expect(can).toBe(true)
    })

    it('should allow client to manually close shift', () => {
      const clientContext = { ...inProgressContext, actorRole: 'client' as const }
      const can = canTransition('in_progress', 'completed', clientContext)
      expect(can).toBe(true)
    })

    it('should release payment and request ratings', () => {
      const result = transition('completed', inProgressContext)
      expect(result.success).toBe(true)
      expect(result.effects).toContainEqual({ type: 'release_payment' })
      expect(result.effects).toContainEqual({ type: 'request_ratings' })
    })

    it('should update statistics for all participants', () => {
      const result = transition('completed', inProgressContext)
      const statEffects = result.effects?.filter(e => e.type === 'update_statistics')
      expect(statEffects).toHaveLength(3) // client + 2 workers
    })
  })

  describe('in_progress → disputed', () => {
    const inProgressContext: TransitionContext = {
      ...baseContext,
      actorRole: 'client',
      shift: {
        ...baseContext.shift,
        status: 'in_progress',
        start_time: new Date(Date.now() - 1 * 60 * 60 * 1000), // started 1h ago
        assigned_workers: [{ id: 'worker-1', checked_in: true }]
      }
    }

    it('should allow client to open dispute within 24h', () => {
      const can = canTransition('in_progress', 'disputed', inProgressContext)
      expect(can).toBe(true)
    })

    it('should allow worker to open dispute', () => {
      const workerContext = { ...inProgressContext, actorRole: 'worker' as const }
      const can = canTransition('in_progress', 'disputed', workerContext)
      expect(can).toBe(true)
    })

    it('should not allow dispute after 24h', () => {
      const lateContext = {
        ...inProgressContext,
        shift: {
          ...inProgressContext.shift,
          start_time: new Date(Date.now() - 25 * 60 * 60 * 1000) // started 25h ago
        }
      }
      const can = canTransition('in_progress', 'disputed', lateContext)
      expect(can).toBe(false)
    })

    it('should freeze payment', () => {
      const result = transition('disputed', inProgressContext)
      expect(result.success).toBe(true)
      expect(result.effects).toContainEqual({ type: 'freeze_payment' })
    })
  })

  describe('completed → disputed', () => {
    const completedContext: TransitionContext = {
      ...baseContext,
      actorRole: 'worker',
      shift: {
        ...baseContext.shift,
        status: 'completed',
        assigned_workers: [{ id: 'worker-1', checked_in: true }]
      }
    }

    it('should allow reopening dispute', () => {
      const can = canTransition('completed', 'disputed', completedContext)
      expect(can).toBe(true)
    })
  })

  describe('disputed → completed/cancelled (admin resolution)', () => {
    const disputedContext: TransitionContext = {
      ...baseContext,
      actorRole: 'admin',
      shift: {
        ...baseContext.shift,
        status: 'disputed',
        assigned_workers: [{ id: 'worker-1', checked_in: true }]
      }
    }

    it('should allow admin to resolve to completed', () => {
      const can = canTransition('disputed', 'completed', disputedContext)
      expect(can).toBe(true)
    })

    it('should allow admin to resolve to cancelled (refund)', () => {
      const can = canTransition('disputed', 'cancelled', disputedContext)
      expect(can).toBe(true)
    })

    it('should not allow client/worker to resolve', () => {
      const clientContext = { ...disputedContext, actorRole: 'client' as const }
      const canClient = canTransition('disputed', 'completed', clientContext)
      expect(canClient).toBe(false)
    })
  })

  describe('getAvailableTransitions', () => {
    it('should return available transitions for draft', () => {
      const available = getAvailableTransitions('draft', baseContext)
      expect(available).toContain('open')
      expect(available).toContain('cancelled')
    })

    it('should return empty array for cancelled (final state)', () => {
      const cancelledContext = { ...baseContext, shift: { ...baseContext.shift, status: 'cancelled' as ShiftStatus } }
      const available = getAvailableTransitions('cancelled', cancelledContext)
      expect(available).toEqual([])
    })
  })

  describe('isFinalStatus', () => {
    it('should return true for cancelled', () => {
      expect(isFinalStatus('cancelled')).toBe(true)
    })

    it('should return true for completed', () => {
      expect(isFinalStatus('completed')).toBe(true)
    })

    it('should return false for open', () => {
      expect(isFinalStatus('open')).toBe(false)
    })
  })

  describe('illegal transitions', () => {
    it('should not allow in_progress → open', () => {
      const context = { ...baseContext, shift: { ...baseContext.shift, status: 'in_progress' as ShiftStatus } }
      const result = transition('open', context)
      expect(result.success).toBe(false)
    })

    it('should not allow completed → open', () => {
      const context = { ...baseContext, shift: { ...baseContext.shift, status: 'completed' as ShiftStatus } }
      const result = transition('open', context)
      expect(result.success).toBe(false)
    })

    it('should not allow cancelled → any', () => {
      const context = { ...baseContext, shift: { ...baseContext.shift, status: 'cancelled' as ShiftStatus } }
      const result = transition('open', context)
      expect(result.success).toBe(false)
    })
  })
})
