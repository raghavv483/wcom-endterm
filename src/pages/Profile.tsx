import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { User, LogOut, Key, Activity, Edit2, Save, X, Calendar, Clock, Zap } from 'lucide-react';
import { format } from 'date-fns';

interface ApiKeyUsage {
  id: string;
  api_key_masked: string;
  service: string;
  last_used: string;
  request_count: number;
}

interface ActivityLog {
  id: string;
  endpoint: string;
  method: string;
  status_code: number;
  response_time_ms: number;
  timestamp: string;
  api_key_used: string;
}

export default function Profile() {
  const navigate = useNavigate();
  const { user, logout, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editedUsername, setEditedUsername] = useState(user?.username || '');
  const [apiKeyUsage, setApiKeyUsage] = useState<ApiKeyUsage[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
    } else {
      fetchApiKeyUsage();
      fetchActivityLogs();
    }
  }, [user, navigate]);

  const fetchApiKeyUsage = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/profile/api-key-usage', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setApiKeyUsage(data);
      }
    } catch (err) {
      console.error('Failed to fetch API key usage:', err);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const response = await fetch('/api/profile/activity-logs?limit=50', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setActivityLogs(data);
      }
    } catch (err) {
      console.error('Failed to fetch activity logs:', err);
    }
  };

  const handleSaveUsername = async () => {
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      await updateProfile(editedUsername);
      setSuccess('Profile updated successfully');
      setIsEditing(false);
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (err) {
      setError('Failed to logout');
    }
  };

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen p-6 lg:p-8 animate-fade-in bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600">
              <User className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold wave-gradient-text">Profile</h1>
              <p className="text-muted-foreground">Manage your account and API usage</p>
            </div>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>

        {/* Alerts */}
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        {success && (
          <Alert className="border-green-200 bg-green-50">
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        {/* Profile Section */}
        <Card className="p-8 glass-card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <User className="h-6 w-6 text-primary" />
              Account Information
            </h2>
            {!isEditing && (
              <Button
                onClick={() => setIsEditing(true)}
                variant="outline"
                className="gap-2"
              >
                <Edit2 className="h-4 w-4" />
                Edit
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Email */}
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Email</label>
              <div className="p-3 bg-muted rounded-lg font-medium">{user.email}</div>
              <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground">Username</label>
              {isEditing ? (
                <Input
                  value={editedUsername}
                  onChange={(e) => setEditedUsername(e.target.value)}
                  placeholder="Enter username"
                />
              ) : (
                <div className="p-3 bg-muted rounded-lg font-medium">{user.username}</div>
              )}
            </div>

            {/* Account Creation Date */}
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Account Created
              </label>
              <div className="p-3 bg-muted rounded-lg">
                {format(new Date(user.created_at), 'PPP p')}
              </div>
            </div>

            {/* Last Login */}
            <div>
              <label className="block text-sm font-medium mb-2 text-muted-foreground flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Last Login
              </label>
              <div className="p-3 bg-muted rounded-lg">
                {user.last_login
                  ? format(new Date(user.last_login), 'PPP p')
                  : 'This is your first login'}
              </div>
            </div>
          </div>

          {/* Edit Actions */}
          {isEditing && (
            <div className="flex gap-3 mt-6 pt-6 border-t">
              <Button
                onClick={handleSaveUsername}
                className="gap-2"
                disabled={loading}
              >
                <Save className="h-4 w-4" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                onClick={() => {
                  setIsEditing(false);
                  setEditedUsername(user.username);
                }}
                variant="outline"
                className="gap-2"
              >
                <X className="h-4 w-4" />
                Cancel
              </Button>
            </div>
          )}
        </Card>

        {/* API Key Usage & Activity */}
        <Tabs defaultValue="usage" className="space-y-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="usage" className="gap-2">
              <Key className="h-4 w-4" />
              API Key Usage
            </TabsTrigger>
            <TabsTrigger value="activity" className="gap-2">
              <Activity className="h-4 w-4" />
              Activity History
            </TabsTrigger>
          </TabsList>

          {/* API Key Usage Tab */}
          <TabsContent value="usage">
            <Card className="p-8 glass-card">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Key className="h-6 w-6 text-primary" />
                API Key Usage
              </h3>

              {apiKeyUsage.length === 0 ? (
                <div className="text-center py-12">
                  <Key className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No API keys have been used yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {apiKeyUsage.map((usage) => (
                    <div
                      key={usage.id}
                      className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">API Key</p>
                          <p className="font-mono text-sm font-medium">{usage.api_key_masked}</p>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Service</p>
                          <Badge className="bg-blue-100 text-blue-800">{usage.service}</Badge>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Requests</p>
                          <div className="flex items-center gap-1">
                            <Zap className="h-4 w-4 text-yellow-500" />
                            <span className="font-semibold">{usage.request_count}</span>
                          </div>
                        </div>
                        <div>
                          <p className="text-sm text-muted-foreground mb-1">Last Used</p>
                          <p className="text-sm">
                            {format(new Date(usage.last_used), 'PP p')}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </TabsContent>

          {/* Activity History Tab */}
          <TabsContent value="activity">
            <Card className="p-8 glass-card">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Activity className="h-6 w-6 text-primary" />
                Activity History
              </h3>

              {activityLogs.length === 0 ? (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground">No activity yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-3 px-4 font-semibold text-sm">Endpoint</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Method</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Status</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Time (ms)</th>
                        <th className="text-left py-3 px-4 font-semibold text-sm">Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {activityLogs.map((log) => (
                        <tr key={log.id} className="border-b hover:bg-muted/50 transition-colors">
                          <td className="py-3 px-4 text-sm font-mono">{log.endpoint}</td>
                          <td className="py-3 px-4">
                            <Badge variant="outline">{log.method}</Badge>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              className={
                                log.status_code >= 200 && log.status_code < 300
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }
                            >
                              {log.status_code}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-sm">{log.response_time_ms}ms</td>
                          <td className="py-3 px-4 text-sm text-muted-foreground">
                            {format(new Date(log.timestamp), 'PPP p')}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
