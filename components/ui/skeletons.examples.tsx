/**
 * Skeleton Components - Usage Examples
 *
 * This file demonstrates how to use skeleton loaders
 * for different parts of the application.
 */

import SkeletonCard from './SkeletonCard'
import SkeletonList from './SkeletonList'
import SkeletonProfile from './SkeletonProfile'
import SkeletonMessage from './SkeletonMessage'
import { SkeletonChatList } from './SkeletonChat'
import { SkeletonDocumentList } from './SkeletonDocument'

// ============================================
// 1. СПИСОК СМЕН (поиск, главная)
// ============================================
function ShiftsListExample() {
  const loading = true // Replace with actual loading state

  return (
    <div className="p-4">
      {loading ? (
        <SkeletonList count={9} columns={3} />
      ) : (
        // <ShiftGrid shifts={shifts} />
        <div>Actual shifts list</div>
      )}
    </div>
  )
}

// ============================================
// 2. ПРОФИЛЬ ПОЛЬЗОВАТЕЛЯ
// ============================================
function ProfilePageExample() {
  const loading = true

  return (
    <div className="p-4">
      {loading ? (
        <SkeletonProfile />
      ) : (
        // <ProfileCard user={user} />
        <div>Actual profile</div>
      )}
    </div>
  )
}

// ============================================
// 3. СПИСОК ЧАТОВ
// ============================================
function ChatsListExample() {
  const loading = true

  return (
    <div>
      {loading ? (
        <SkeletonChatList count={8} />
      ) : (
        // <ChatList chats={chats} />
        <div>Actual chats</div>
      )}
    </div>
  )
}

// ============================================
// 4. ОКНО ЧАТА (сообщения)
// ============================================
function ChatWindowExample() {
  const loading = true

  return (
    <div className="p-4">
      {loading ? (
        <SkeletonMessage />
      ) : (
        // <MessageList messages={messages} />
        <div>Actual messages</div>
      )}
    </div>
  )
}

// ============================================
// 5. СПИСОК ДОКУМЕНТОВ
// ============================================
function DocumentsListExample() {
  const loading = true

  return (
    <div className="p-4">
      {loading ? (
        <SkeletonDocumentList count={6} />
      ) : (
        // <DocumentGrid documents={documents} />
        <div>Actual documents</div>
      )}
    </div>
  )
}

// ============================================
// 6. ДЕТАЛИ СМЕНЫ
// ============================================
function ShiftDetailExample() {
  const loading = true

  return (
    <div className="p-4 space-y-4">
      {loading ? (
        <>
          {/* Client info */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 animate-pulse">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/10 rounded-full"></div>
              <div className="flex-1">
                <div className="h-4 bg-white/10 rounded w-32 mb-2"></div>
                <div className="h-3 bg-white/10 rounded w-24"></div>
              </div>
            </div>
          </div>

          {/* Main card */}
          <SkeletonCard />
        </>
      ) : (
        // <ShiftDetail shift={shift} />
        <div>Actual shift details</div>
      )}
    </div>
  )
}

// ============================================
// 7. СПИСОК WORKERS
// ============================================
function WorkersListExample() {
  const loading = true

  return (
    <div className="p-4">
      {loading ? (
        <SkeletonList count={6} columns={2} />
      ) : (
        // <WorkerGrid workers={workers} />
        <div>Actual workers</div>
      )}
    </div>
  )
}

// ============================================
// 8. ИЗБРАННОЕ
// ============================================
function FavoritesExample() {
  const loading = true

  return (
    <div className="p-4">
      {loading ? (
        <SkeletonList count={4} columns={2} />
      ) : (
        // <FavoritesList favorites={favorites} />
        <div>Actual favorites</div>
      )}
    </div>
  )
}

// ============================================
// 9. ИСТОРИЯ ПЛАТЕЖЕЙ
// ============================================
function PaymentHistoryExample() {
  const loading = true

  return (
    <div className="p-4 space-y-3">
      {loading ? (
        <>
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-white/5 border border-white/10 rounded-2xl p-4 animate-pulse"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/10 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-white/10 rounded w-32 mb-2"></div>
                    <div className="h-3 bg-white/10 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-5 bg-white/10 rounded w-20"></div>
              </div>
            </div>
          ))}
        </>
      ) : (
        // <PaymentList payments={payments} />
        <div>Actual payments</div>
      )}
    </div>
  )
}

// ============================================
// 10. CUSTOM СКЕЛЕТОН (build your own)
// ============================================
function CustomSkeletonExample() {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <div className="w-12 h-12 bg-white/10 rounded-full"></div>
        <div className="flex-1">
          <div className="h-4 bg-white/10 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-white/10 rounded w-1/2"></div>
        </div>
      </div>

      {/* Body */}
      <div className="space-y-2 mb-4">
        <div className="h-3 bg-white/10 rounded w-full"></div>
        <div className="h-3 bg-white/10 rounded w-5/6"></div>
        <div className="h-3 bg-white/10 rounded w-4/6"></div>
      </div>

      {/* Footer */}
      <div className="flex gap-2">
        <div className="h-8 bg-white/10 rounded-lg flex-1"></div>
        <div className="h-8 bg-white/10 rounded-lg w-24"></div>
      </div>
    </div>
  )
}

export {
  ShiftsListExample,
  ProfilePageExample,
  ChatsListExample,
  ChatWindowExample,
  DocumentsListExample,
  ShiftDetailExample,
  WorkersListExample,
  FavoritesExample,
  PaymentHistoryExample,
  CustomSkeletonExample
}
