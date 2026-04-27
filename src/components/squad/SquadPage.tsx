import { useState, useEffect } from 'react';
import { Trophy, Users, MessageCircle, Flame, Target, Zap, Crown, Medal, Star, UserPlus, Bell } from 'lucide-react';
import { FriendsList } from './FriendsList';
import { DiscoverUsers } from './DiscoverUsers';
import { getPendingFriendRequests, getFriends, getUserProfile, calculateDetailedHealthScore, getLast30DaysEntries } from '@/lib/store';

interface SquadMember {
  id: string;
  name: string;
  avatar: string;
  score: number;
  streak: number;
  level: 'Rookie' | 'Warrior' | 'Legend' | 'Master';
}

type ChallengeType = 'Sprint' | 'Marathon' | 'Battle' | 'CoOp';

interface Challenge {
  id: string;
  name: string;
  type: ChallengeType;
  progress: number;
  target: number;
  daysLeft: number;
  participants: number;
}

const mockSquadMembers: SquadMember[] = [
  { id: '1', name: 'You', avatar: 'Y', score: 85, streak: 12, level: 'Warrior' },
  { id: '2', name: 'Sarah', avatar: 'S', score: 92, streak: 24, level: 'Legend' },
  { id: '3', name: 'Mike', avatar: 'M', score: 78, streak: 8, level: 'Warrior' },
  { id: '4', name: 'Emma', avatar: 'E', score: 88, streak: 15, level: 'Warrior' },
];

const mockChallenges: Challenge[] = [
  { id: '1', name: '7-Day Sleep Sprint', type: 'Sprint', progress: 5, target: 7, daysLeft: 2, participants: 4 },
  { id: '2', name: '30-Day Hydration Marathon', type: 'Marathon', progress: 18, target: 30, daysLeft: 12, participants: 4 },
  { id: '3', name: 'Battle: Steps Challenge', type: 'Battle', progress: 8500, target: 10000, daysLeft: 1, participants: 4 },
  { id: '4', name: 'Team Hydration Co-op', type: 'CoOp', progress: 15, target: 20, daysLeft: 5, participants: 4 },
];

const levelColors = {
  Rookie: 'bg-gray-400',
  Warrior: 'bg-blue-500',
  Legend: 'bg-purple-500',
  Master: 'bg-amber-500',
};

const typeIcons: Record<ChallengeType, typeof Zap> = {
  Sprint: Zap,
  Marathon: Target,
  Battle: Trophy,
  CoOp: Users,
};

export function SquadPage() {
  const [activeTab, setActiveTab] = useState<'leaderboard' | 'challenges' | 'chat' | 'friends' | 'discover'>('discover');
  const [chatMessages, setChatMessages] = useState([
    { id: '1', user: 'Sarah', message: 'Just hit my 10K steps! 🔥', time: '2 min ago' },
    { id: '2', user: 'Mike', message: 'Great job! I\'m at 8.5K', time: '1 min ago' },
    { id: '3', user: 'Emma', message: 'Keep pushing team! We got this 💪', time: '30 sec ago' },
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [challenges, setChallenges] = useState<Challenge[]>(mockChallenges);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState(0);
  const [friends, setFriends] = useState(getFriends());

  // Get current user data
  const currentUser = getUserProfile();
  const currentUserEntries = getLast30DaysEntries();
  const currentUserScore = calculateDetailedHealthScore(currentUserEntries);

  // Build squad members list with current user and friends
  const squadMembers: SquadMember[] = [
    {
      id: 'you',
      name: currentUser?.name || 'You',
      avatar: currentUser?.name?.charAt(0).toUpperCase() || 'Y',
      score: currentUserScore.overall,
      streak: currentUserScore.streak,
      level: currentUserScore.level,
    },
    ...friends.map(friend => ({
      id: friend.email,
      name: friend.name,
      avatar: friend.name.charAt(0).toUpperCase(),
      score: friend.healthScore || 0,
      streak: friend.streak || 0,
      level: (friend.level as 'Rookie' | 'Warrior' | 'Legend' | 'Master') || 'Rookie',
    })),
  ];

  const sortedMembers = [...squadMembers].sort((a, b) => b.score - a.score);

  const availableChallenges: Omit<Challenge, 'id' | 'progress' | 'participants'>[] = [
    { name: '14-Day Meditation Quest', type: 'Marathon', target: 14, daysLeft: 14 },
    { name: 'Daily Steps Battle', type: 'Battle', target: 10000, daysLeft: 7 },
    { name: '5-Day Water Sprint', type: 'Sprint', target: 5, daysLeft: 5 },
    { name: 'Team Exercise Co-op', type: 'CoOp', target: 150, daysLeft: 10 },
    { name: 'Sleep Consistency Challenge', type: 'Marathon', target: 21, daysLeft: 21 },
    { name: 'Weekend Warrior Battle', type: 'Battle', target: 15000, daysLeft: 3 },
  ];
  const [selectedChallenge, setSelectedChallenge] = useState<number | null>(null);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setChatMessages([...chatMessages, {
        id: Date.now().toString(),
        user: 'You',
        message: newMessage,
        time: 'Just now'
      }]);
      setNewMessage('');
    }
  };

  const handleJoinChallenge = () => {
    if (selectedChallenge !== null) {
      const newChallenge = availableChallenges[selectedChallenge];
      const challengeToAdd: Challenge = {
        id: Date.now().toString(),
        name: newChallenge.name,
        type: newChallenge.type,
        progress: 0,
        target: newChallenge.target,
        daysLeft: newChallenge.daysLeft,
        participants: 1,
      };
      setChallenges([...challenges, challengeToAdd]);
      setShowJoinModal(false);
      setSelectedChallenge(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gradient-primary">Squad Challenges</h1>
        <p className="text-muted-foreground">Team up, compete, and achieve together</p>
      </div>

      {/* Squad Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-amber-50 to-amber-100 p-4 rounded-xl border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="w-5 h-5 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">Squad Rank</span>
          </div>
          <p className="text-2xl font-bold text-amber-800">#42</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Members</span>
          </div>
          <p className="text-2xl font-bold text-blue-800">4/5</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-xl border border-red-200">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="w-5 h-5 text-red-600" />
            <span className="text-sm font-medium text-red-700">Avg Streak</span>
          </div>
          <p className="text-2xl font-bold text-red-800">14.7 days</p>
        </div>
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
          <div className="flex items-center gap-2 mb-2">
            <Star className="w-5 h-5 text-green-600" />
            <span className="text-sm font-medium text-green-700">Team Score</span>
          </div>
          <p className="text-2xl font-bold text-green-800">85.5</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-muted p-1 rounded-lg">
        {(['discover', 'friends', 'leaderboard', 'challenges', 'chat'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex-1 py-2 px-3 rounded-md font-medium capitalize transition-all text-sm ${
              activeTab === tab
                ? 'bg-white text-primary shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'discover' && <UserPlus className="w-4 h-4 inline mr-1" />}
            {tab === 'friends' && (
              <>
                <Users className="w-4 h-4 inline mr-1" />
                {pendingRequestsCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.5 bg-red-500 text-white text-xs rounded-full">
                    {pendingRequestsCount}
                  </span>
                )}
              </>
            )}
            {tab === 'leaderboard' && <Trophy className="w-4 h-4 inline mr-1" />}
            {tab === 'challenges' && <Target className="w-4 h-4 inline mr-1" />}
            {tab === 'chat' && <MessageCircle className="w-4 h-4 inline mr-1" />}
            {tab}
          </button>
        ))}
      </div>

      {/* Discover Tab */}
      {activeTab === 'discover' && <DiscoverUsers />}

      {/* Friends Tab */}
      {activeTab === 'friends' && <FriendsList />}

      {/* Leaderboard Tab */}
      {activeTab === 'leaderboard' && (
        <div className="space-y-4">
          <div className="bg-white rounded-xl shadow-card border border-border overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-100">
              <h3 className="font-semibold text-amber-800 flex items-center gap-2">
                <Crown className="w-5 h-5" />
                Weekly Leaderboard
              </h3>
            </div>
            {squadMembers.length === 1 ? (
              <div className="p-8 text-center">
                <Users className="w-12 h-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="text-muted-foreground">No friends in your squad yet</p>
                <button
                  onClick={() => setActiveTab('discover')}
                  className="mt-4 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors text-sm font-medium"
                >
                  Discover Friends
                </button>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {sortedMembers.map((member, index) => (
                  <div
                    key={member.id}
                    className={`p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors ${
                      member.id === 'you' ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className={`flex items-center justify-center w-8 h-8 rounded-full font-bold text-sm ${
                      index === 0 ? 'bg-amber-100 text-amber-700' : 
                      index === 1 ? 'bg-gray-100 text-gray-700' : 
                      index === 2 ? 'bg-orange-100 text-orange-700' : 'bg-muted text-muted-foreground'
                    }`}>
                      {index + 1}
                    </div>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold ${levelColors[member.level]}`}>
                      {member.avatar}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{member.name}</span>
                        {member.id === 'you' && (
                          <span className="px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full">You</span>
                        )}
                        {index === 0 && member.id !== 'you' && <Medal className="w-4 h-4 text-amber-500" />}
                      </div>
                      <span className="text-xs text-muted-foreground">{member.level}</span>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{member.score}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Flame className="w-3 h-3 text-red-500" />
                        {member.streak} day streak
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Challenges Tab */}
      {activeTab === 'challenges' && (
        <div className="space-y-4">
          {challenges.map((challenge) => {
            const Icon = typeIcons[challenge.type];
            const progressPercent = (challenge.progress / challenge.target) * 100;
            
            return (
              <div key={challenge.id} className="bg-white rounded-xl shadow-card border border-border p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{challenge.name}</h3>
                      <span className="text-sm text-muted-foreground">{challenge.type} Challenge</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-medium bg-primary/10 text-primary">
                    {challenge.daysLeft} days left
                  </span>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">{challenge.progress} / {challenge.target}</span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-primary/70 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
                  <Users className="w-4 h-4" />
                  <span>{challenge.participants} participants</span>
                </div>
              </div>
            );
          })}
          
          <button 
            onClick={() => setShowJoinModal(true)}
            className="w-full py-3 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary hover:text-primary transition-colors font-medium"
          >
            + Join New Challenge
          </button>
        </div>
      )}

      {/* Chat Tab */}
      {activeTab === 'chat' && (
        <div className="bg-white rounded-xl shadow-card border border-border overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border">
            <h3 className="font-semibold flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              Squad Chat
            </h3>
          </div>
          <div className="h-64 overflow-y-auto p-4 space-y-3">
            {chatMessages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.user === 'You' ? 'flex-row-reverse' : ''}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-semibold ${
                  msg.user === 'You' ? 'bg-primary' : 'bg-sage'
                }`}>
                  {msg.user[0]}
                </div>
                <div className={`max-w-[70%] ${msg.user === 'You' ? 'text-right' : ''}`}>
                  <div className={`inline-block px-3 py-2 rounded-lg text-sm ${
                    msg.user === 'You' 
                      ? 'bg-primary text-white' 
                      : 'bg-muted'
                  }`}>
                    {msg.message}
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{msg.time}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 border-t border-border flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <button
              onClick={handleSendMessage}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Join Challenge Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50" onClick={() => setShowJoinModal(false)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-border">
              <h2 className="text-2xl font-bold text-gradient-primary">Join a Challenge</h2>
              <p className="text-sm text-muted-foreground mt-1">Choose a challenge to participate in</p>
            </div>
            
            <div className="p-6 space-y-3">
              {availableChallenges.map((challenge, index) => {
                const Icon = typeIcons[challenge.type];
                const isSelected = selectedChallenge === index;
                
                return (
                  <button
                    key={index}
                    onClick={() => setSelectedChallenge(index)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? 'bg-primary text-white' : 'bg-primary/10 text-primary'
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{challenge.name}</h3>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                          <span>{challenge.type}</span>
                          <span>•</span>
                          <span>Target: {challenge.target}</span>
                          <span>•</span>
                          <span>{challenge.daysLeft} days</span>
                        </div>
                      </div>
                      {isSelected && (
                        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                          <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="p-6 border-t border-border flex gap-3">
              <button
                onClick={() => {
                  setShowJoinModal(false);
                  setSelectedChallenge(null);
                }}
                className="flex-1 py-2.5 border border-border rounded-lg hover:bg-muted transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleJoinChallenge}
                disabled={selectedChallenge === null}
                className="flex-1 py-2.5 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Join Challenge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
