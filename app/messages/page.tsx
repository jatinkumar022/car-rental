'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Loader from '@/components/Loader';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface Message {
  _id: string;
  bookingId?: {
    _id: string;
    carId?: {
      make: string;
      model: string;
    };
  };
  senderId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    profileImage?: string;
  };
  receiverId: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    profileImage?: string;
  };
  messageText: string;
  isRead: boolean;
  createdAt: string;
}

interface Conversation {
  bookingId?: string;
  otherUser: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email: string;
    profileImage?: string;
  };
  carInfo?: {
    make: string;
    model: string;
  };
  lastMessage?: Message;
  unreadCount: number;
}

export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  const fetchConversations = useCallback(async () => {
    try {
      // Get all bookings for the user
      const bookingsRes = await fetch('/api/bookings');
      const bookingsData = await bookingsRes.json();
      
      if (!bookingsRes.ok) {
        toast.error(bookingsData.error || 'Failed to fetch bookings');
        return;
      }

      const allBookings = bookingsData.bookings || [];
      const conversationsMap = new Map<string, Conversation>();

      // Get messages for each booking
      for (const booking of allBookings) {
        try {
          const messagesRes = await fetch(`/api/messages?bookingId=${booking._id}`);
          const messagesData = await messagesRes.json();
          
          if (messagesRes.ok && messagesData.messages) {
            const bookingMessages = messagesData.messages as Message[];
            
            if (bookingMessages.length > 0) {
              const otherUser = booking.renterId?._id === session?.user?.id
                ? booking.hostId
                : booking.renterId;
              
              if (otherUser) {
                const key = booking._id;
                const existing = conversationsMap.get(key);
                const unreadCount = bookingMessages.filter(
                  m => !m.isRead && m.receiverId._id === session?.user?.id
                ).length;
                
                conversationsMap.set(key, {
                  bookingId: booking._id,
                  otherUser: otherUser,
                  carInfo: booking.carId ? {
                    make: booking.carId.make,
                    model: booking.carId.model,
                  } : undefined,
                  lastMessage: bookingMessages[bookingMessages.length - 1],
                  unreadCount: existing ? existing.unreadCount + unreadCount : unreadCount,
                });
              }
            }
          }
        } catch (error) {
            console.error('Error fetching messages for booking:', error);
          }
      }

      setConversations(Array.from(conversationsMap.values()));
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Error fetching conversations');
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login');
    } else if (status === 'authenticated' && session?.user?.id) {
      fetchConversations();
    }
  }, [status, router, session?.user?.id, fetchConversations]);

  const fetchMessages = async (bookingId: string) => {
    try {
      const res = await fetch(`/api/messages?bookingId=${bookingId}`);
      const data = await res.json();
      if (res.ok) {
        setMessages(data.messages || []);
      } else {
        toast.error(data.error || 'Failed to fetch messages');
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Error fetching messages');
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation?.bookingId) return;

    setSending(true);
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: selectedConversation.bookingId,
          messageText: newMessage,
        }),
      });

      const data = await res.json();
      if (res.ok) {
        setNewMessage('');
        fetchMessages(selectedConversation.bookingId);
        fetchConversations();
      } else {
        toast.error(data.error || 'Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Error sending message');
    } finally {
      setSending(false);
    }
  };

  const handleSelectConversation = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    if (conversation.bookingId) {
      fetchMessages(conversation.bookingId);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-[#F7F7FA] flex items-center justify-center">
        <Loader size="lg" text="Loading messages..." />
      </div>
    );
  }

  if (!session) return null;

  const otherUserName = selectedConversation?.otherUser
    ? (selectedConversation.otherUser.firstName && selectedConversation.otherUser.lastName
        ? `${selectedConversation.otherUser.firstName} ${selectedConversation.otherUser.lastName}`
        : selectedConversation.otherUser.email)
    : 'User';

  return (
    <div className="min-h-screen bg-[#F7F7FA] py-8">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[#1A1A2E] sm:text-4xl">
            Messages
          </h1>
          <p className="mt-2 text-base text-[#6C6C80] sm:text-lg">
            Communicate with hosts and renters
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)]">
              <CardHeader>
                <CardTitle className="text-[#1A1A2E]">Conversations</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {conversations.length > 0 ? (
                  <div className="divide-y divide-[#E5E5EA]">
                    {conversations.map((conversation) => {
                      const userName = conversation.otherUser.firstName && conversation.otherUser.lastName
                        ? `${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`
                        : conversation.otherUser.email;
                      
                      return (
                        <button
                          key={conversation.bookingId}
                          onClick={() => handleSelectConversation(conversation)}
                          className={`w-full p-4 text-left hover:bg-[#F7F7FA] transition ${
                            selectedConversation?.bookingId === conversation.bookingId
                              ? 'bg-[#E6FFF9] border-l-4 border-[#00D09C]'
                              : ''
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-[#00D09C] flex items-center justify-center text-white font-semibold shrink-0">
                              {userName.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between mb-1">
                                <p className="font-semibold text-[#1A1A2E] truncate">
                                  {userName}
                                </p>
                                {conversation.unreadCount > 0 && (
                                  <Badge className="bg-[#00D09C] text-white">
                                    {conversation.unreadCount}
                                  </Badge>
                                )}
                              </div>
                              {conversation.carInfo && (
                                <p className="text-sm text-[#6C6C80] truncate mb-1">
                                  {conversation.carInfo.make} {conversation.carInfo.model}
                                </p>
                              )}
                              {conversation.lastMessage && (
                                <p className="text-xs text-[#6C6C80] truncate">
                                  {conversation.lastMessage.messageText}
                                </p>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <div className="p-8 text-center">
                    <MessageSquare className="h-12 w-12 text-[#6C6C80] mx-auto mb-4" />
                    <p className="text-[#6C6C80]">No conversations yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Messages Area */}
          <div className="lg:col-span-2">
            {selectedConversation ? (
              <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)] h-[600px] flex flex-col">
                <CardHeader className="border-b border-[#E5E5EA]">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-[#00D09C] flex items-center justify-center text-white font-semibold">
                      {otherUserName.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-[#1A1A2E]">{otherUserName}</CardTitle>
                      {selectedConversation.carInfo && (
                        <p className="text-sm text-[#6C6C80]">
                          {selectedConversation.carInfo.make} {selectedConversation.carInfo.model}
                        </p>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length > 0 ? (
                    messages.map((message) => {
                      const isOwn = message.senderId._id === session.user?.id;
                      const senderName = message.senderId.firstName && message.senderId.lastName
                        ? `${message.senderId.firstName} ${message.senderId.lastName}`
                        : message.senderId.email;

                      return (
                        <div
                          key={message._id}
                          className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}
                        >
                          <div className={`h-8 w-8 rounded-full bg-[#00D09C] flex items-center justify-center text-white text-xs font-semibold shrink-0`}>
                            {senderName.charAt(0).toUpperCase()}
                          </div>
                          <div className={`flex-1 max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                            <div
                              className={`inline-block p-3 rounded-lg ${
                                isOwn
                                  ? 'bg-[#00D09C] text-white'
                                  : 'bg-[#E5E5EA] text-[#1A1A2E]'
                              }`}
                            >
                              <p className="text-sm">{message.messageText}</p>
                            </div>
                            <p className="text-xs text-[#6C6C80] mt-1">
                              {format(new Date(message.createdAt), 'MMM dd, hh:mm a')}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-[#6C6C80]">No messages yet. Start the conversation!</p>
                    </div>
                  )}
                </CardContent>
                <div className="border-t border-[#E5E5EA] p-4">
                  <div className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim() || sending}
                      className="bg-[#00D09C] hover:bg-[#00B386] text-white"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="shadow-[0_4px_16px_rgba(0,0,0,0.12)] h-[600px] flex items-center justify-center">
                <CardContent className="text-center">
                  <MessageSquare className="h-16 w-16 text-[#6C6C80] mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-[#1A1A2E] mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-[#6C6C80]">
                    Choose a conversation from the list to start messaging
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

