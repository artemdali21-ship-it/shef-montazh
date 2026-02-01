/**
 * Skeleton Components - Central Export
 *
 * Import all skeleton components from this file:
 * import { SkeletonCard, SkeletonList, SkeletonProfile } from '@/components/ui/skeletons'
 */

// Basic skeletons
export { default as SkeletonCard } from './SkeletonCard'
export { default as SkeletonList } from './SkeletonList'
export { default as SkeletonProfile } from './SkeletonProfile'

// Messaging skeletons
export { default as SkeletonMessage } from './SkeletonMessage'
export { default as SkeletonChat, SkeletonChatList } from './SkeletonChat'

// Document skeleton
export { default as SkeletonDocument, SkeletonDocumentList } from './SkeletonDocument'

// Original skeletons (from existing Skeleton.tsx)
export {
  Skeleton,
  SkeletonCard as SkeletonCardOld,
  SkeletonShiftCard,
  SkeletonProfileHeader,
  SkeletonList as SkeletonListOld,
  SkeletonStats
} from './Skeleton'
