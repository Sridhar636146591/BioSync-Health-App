import { UserPlus, Check, X, UserCheck } from 'lucide-react';
import { calculateHealthScore, calculateStreak, calculateDetailedHealthScore, getEntryByDate } from '@/lib/store';
import type { UserProfile } from '@/lib/store';

interface UserCardProps {
  user: UserProfile;
  isFriend?: boolean;
  hasPendingRequest?: boolean;
  onAddFriend?: () => void;
  onAcceptRequest?: () => void;
  onRejectRequest?: () => void;
  showActions?: boolean;
}

export function UserCard({ 
  user, 
  isFriend = false, 
  hasPendingRequest = false,
  onAddFriend, 
  onAcceptRequest,
  onRejectRequest,
  showActions = true 
}: UserCardProps) {
  // Get user's health stats
  const healthKey = `vitalis-health-data-${user.email}`;
  const healthData = localStorage.getItem(healthKey);
  const entries = healthData ? JSON.parse(healthData) : [];
  
  const healthScore = entries.length > 0 ? calculateHealthScore(entries) : 0;
  const streak = entries.length > 0 ? calculateStreak(entries) : 0;
  const detailedScore = entries.length > 0 ? calculateDetailedHealthScore(entries) : null;
  const lastEntry = entries.length > 0 ? entries[0] : null;

  const levelColors: Record<string, string> = {
    Rookie: 'bg-gray-400',
    Warrior: 'bg-blue-500',
    Legend: 'bg-purple-500',
    Master: 'bg-amber-500',
  };

  return (
    <div className="bg-white rounded-xl shadow-card border border-border p-5 hover:shadow-lg transition-all">
      {/* User Info */}
      <div className="flex items-start gap-4">
        <div className={`w-14 h-14 rounded-full flex items-center justify-center text-white text-xl font-bold ${
          levelColors[detailedScore?.level || 'Rookie'] || 'bg-gray-400'
        }`}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        
        <div className="flex-1">
          <h3 className="font-semibold text-lg">{user.name}</h3>
          <p className="text-sm text-muted-foreground">{user.email}</p>
          
          {detailedScore && (
            <div className="flex items-center gap-2 mt-2">
              <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${
                levelColors[detailedScore.level] || 'bg-gray-400'
              }`}>
                {detailedScore.level}
              </span>
              {streak > 0 && (
                <span className="text-xs text-muted-foreground">
                  🔥 {streak} day streak
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Health Stats */}
      {entries.length > 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <div className="grid grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{healthScore}</div>
              <div className="text-xs text-muted-foreground">Health Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-500">{streak}</div>
              <div className="text-xs text-muted-foreground">Day Streak</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-500">{entries.length}</div>
              <div className="text-xs text-muted-foreground">Entries</div>
            </div>
          </div>

          {/* Recent Activity */}
          {lastEntry && (
            <div className="mt-3 pt-3 border-t border-border">
              <p className="text-xs text-muted-foreground mb-2">Last Activity</p>
              <div className="flex gap-4 text-xs">
                <span>😴 {lastEntry.sleepHours}h sleep</span>
                <span>😊 {lastEntry.mood}/5 mood</span>
                <span>💧 {lastEntry.waterGlasses} glasses</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No Data Message */}
      {entries.length === 0 && (
        <div className="mt-4 pt-4 border-t border-border">
          <p className="text-sm text-muted-foreground text-center">
            No health data logged yet
          </p>
        </div>
      )}

      {/* Action Buttons */}
      {showActions && (
        <div className="mt-4 pt-4 border-t border-border">
          {isFriend ? (
            <div className="flex items-center justify-center gap-2 text-green-600">
              <UserCheck className="w-4 h-4" />
              <span className="text-sm font-medium">Friends</span>
            </div>
          ) : hasPendingRequest ? (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground text-center">Friend request pending</p>
              <div className="flex gap-2">
                {onAcceptRequest && (
                  <button
                    onClick={onAcceptRequest}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors text-sm font-medium"
                  >
                    <Check className="w-4 h-4" />
                    Accept
                  </button>
                )}
                {onRejectRequest && (
                  <button
                    onClick={onRejectRequest}
                    className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    <X className="w-4 h-4" />
                    Decline
                  </button>
                )}
              </div>
            </div>
          ) : (
            onAddFriend && (
              <button
                onClick={onAddFriend}
                className="w-full flex items-center justify-center gap-2 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
              >
                <UserPlus className="w-4 h-4" />
                Add Friend
              </button>
            )
          )}
        </div>
      )}
    </div>
  );
}
