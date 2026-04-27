import { useState } from 'react';
import { Users, UserMinus, Trophy, Flame } from 'lucide-react';
import { getFriends, removeFriend } from '@/lib/store';
import type { Friend } from '@/lib/store';

export function FriendsList() {
  const [friends, setFriends] = useState(getFriends());

  const handleRemoveFriend = (friendEmail: string) => {
    if (confirm('Are you sure you want to remove this friend?')) {
      removeFriend(friendEmail);
      setFriends(getFriends());
    }
  };

  const sortedFriends = [...friends].sort((a, b) => (b.healthScore || 0) - (a.healthScore || 0));

  if (friends.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/30 rounded-xl">
        <Users className="w-16 h-16 mx-auto mb-4 text-muted-foreground/50" />
        <h3 className="text-lg font-semibold mb-2">No Friends Yet</h3>
        <p className="text-muted-foreground">
          Discover people and add them as friends to see them here!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Your Friends ({friends.length})</h3>
      </div>

      {/* Friends Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedFriends.map((friend, index) => (
          <div
            key={friend.email}
            className="bg-white rounded-xl shadow-card border border-border p-5 hover:shadow-lg transition-all"
          >
            {/* Rank Badge */}
            <div className="flex items-start justify-between mb-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                index === 0 ? 'bg-amber-100 text-amber-700' : 
                index === 1 ? 'bg-gray-100 text-gray-700' : 
                index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-muted text-muted-foreground'
              }`}>
                #{index + 1}
              </div>
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                {friend.level}
              </span>
            </div>

            {/* Avatar & Name */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white text-lg font-bold">
                {friend.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <h4 className="font-semibold">{friend.name}</h4>
                <p className="text-xs text-muted-foreground">{friend.email}</p>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="bg-gradient-to-br from-primary/5 to-primary/10 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Trophy className="w-4 h-4 text-primary" />
                  <span className="text-xs text-muted-foreground">Score</span>
                </div>
                <div className="text-xl font-bold text-primary">{friend.healthScore || 0}</div>
              </div>
              <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-3 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Flame className="w-4 h-4 text-amber-600" />
                  <span className="text-xs text-muted-foreground">Streak</span>
                </div>
                <div className="text-xl font-bold text-amber-600">{friend.streak || 0} days</div>
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={() => handleRemoveFriend(friend.email)}
              className="w-full flex items-center justify-center gap-2 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors text-sm font-medium"
            >
              <UserMinus className="w-4 h-4" />
              Remove Friend
            </button>
          </div>
        ))}
      </div>

      {/* Leaderboard Style View */}
      <div className="mt-6 bg-white rounded-xl shadow-card border border-border overflow-hidden">
        <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
          <h3 className="font-semibold flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Friends Leaderboard
          </h3>
        </div>
        <div className="divide-y divide-border">
          {sortedFriends.map((friend, index) => (
            <div
              key={friend.email}
              className="p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors"
            >
              <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                index === 0 ? 'bg-amber-100 text-amber-700' : 
                index === 1 ? 'bg-gray-100 text-gray-700' : 
                index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-muted text-muted-foreground'
              }`}>
                {index + 1}
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-white font-semibold">
                {friend.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="font-semibold">{friend.name}</div>
                <div className="text-xs text-muted-foreground">{friend.level}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">{friend.healthScore || 0}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <Flame className="w-3 h-3 text-red-500" />
                  {friend.streak || 0} day streak
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
