import { useState } from 'react';
import { Search, Users } from 'lucide-react';
import { UserCard } from './UserCard';
import { 
  getDiscoverableUsers, 
  getPendingFriendRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  isFriend,
  hasPendingRequestWith
} from '@/lib/store';
import type { UserProfile } from '@/lib/store';

export function DiscoverUsers() {
  const [searchTerm, setSearchTerm] = useState('');
  const [users, setUsers] = useState(getDiscoverableUsers());
  const [pendingRequests, setPendingRequests] = useState(getPendingFriendRequests());

  const handleSendRequest = (userEmail: string) => {
    const success = sendFriendRequest(userEmail);
    if (success) {
      // Refresh the list
      setUsers(getDiscoverableUsers());
    }
  };

  const handleAcceptRequest = (fromEmail: string) => {
    acceptFriendRequest(fromEmail);
    setPendingRequests(getPendingFriendRequests());
    setUsers(getDiscoverableUsers());
  };

  const handleRejectRequest = (fromEmail: string) => {
    rejectFriendRequest(fromEmail);
    setPendingRequests(getPendingFriendRequests());
  };

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Get pending request emails for quick lookup
  const pendingRequestEmails = new Set(pendingRequests.map(r => r.from));

  return (
    <div className="space-y-6">
      {/* Friend Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl border border-amber-200 p-5">
          <h3 className="font-semibold text-amber-800 flex items-center gap-2 mb-4">
            <Users className="w-5 h-5" />
            Friend Requests ({pendingRequests.length})
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            {pendingRequests.map((request) => {
              const allUsers = getDiscoverableUsers();
              // We need to get user info from biosync_users
              const usersList = JSON.parse(localStorage.getItem('biosync_users') || '[]');
              const userData = usersList.find((u: UserProfile) => u.email === request.from);
              
              if (!userData) return null;

              return (
                <UserCard
                  key={request.from}
                  user={userData}
                  hasPendingRequest={true}
                  onAcceptRequest={() => handleAcceptRequest(request.from)}
                  onRejectRequest={() => handleRejectRequest(request.from)}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Discover Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-lg">Discover People</h3>
          <span className="text-sm text-muted-foreground">{filteredUsers.length} users</span>
        </div>

        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Users Grid */}
        {filteredUsers.length > 0 ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => {
              const userIsFriend = isFriend(user.email);
              const hasPending = hasPendingRequestWith(user.email);
              
              return (
                <UserCard
                  key={user.email}
                  user={user}
                  isFriend={userIsFriend}
                  hasPendingRequest={hasPending}
                  onAddFriend={() => handleSendRequest(user.email)}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-muted/30 rounded-xl">
            <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
            <p className="text-muted-foreground">
              {searchTerm ? 'No users found matching your search' : 'No new users to discover'}
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              {searchTerm ? 'Try a different search term' : 'Share the app with friends to connect!'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
