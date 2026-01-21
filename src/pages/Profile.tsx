import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Edit2, Save, X, Loader2 } from 'lucide-react';
import Layout from '@/components/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

const Profile: React.FC = () => {
  const { profile, user, updateProfile } = useAuth();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    const { error } = await updateProfile({ full_name: fullName.trim() });
    
    if (error) {
      toast.error('Failed to update profile');
    } else {
      toast.success('Profile updated successfully');
      setEditing(false);
    }
    setLoading(false);
  };

  const handleCancel = () => {
    setFullName(profile?.full_name || '');
    setEditing(false);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">
            Your Profile
          </h1>
          <p className="text-muted-foreground">
            Manage your account information
          </p>
        </motion.section>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6"
        >
          {/* Avatar */}
          <div className="flex justify-center mb-6">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-3xl font-bold text-primary-foreground">
                {(profile?.full_name || user?.email || 'U').charAt(0).toUpperCase()}
              </span>
            </div>
          </div>

          {/* Profile Fields */}
          <div className="space-y-6">
            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Full Name
              </label>
              {editing ? (
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                />
              ) : (
                <p className="text-lg font-medium text-foreground py-2">
                  {profile?.full_name || 'Not set'}
                </p>
              )}
            </div>

            {/* Email (Read-only) */}
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2">
                <Mail className="w-4 h-4" />
                Email Address
              </label>
              <p className="text-lg font-medium text-foreground py-2">
                {user?.email}
              </p>
              <p className="text-xs text-muted-foreground">Email cannot be changed</p>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-border">
              {editing ? (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleCancel}
                    className="flex-1"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSave}
                    className="flex-1"
                    disabled={loading || !fullName.trim()}
                  >
                    {loading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4 mr-2" />
                    )}
                    Save Changes
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => setEditing(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        </motion.div>

        {/* Account Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card rounded-2xl p-6 mt-6"
        >
          <h2 className="text-lg font-semibold mb-4">Account Information</h2>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Created</span>
              <span className="font-medium">
                {profile?.created_at 
                  ? new Date(profile.created_at).toLocaleDateString('en-IN', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })
                  : 'N/A'
                }
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Account Type</span>
              <span className="font-medium text-primary">Demo Account</span>
            </div>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default Profile;
