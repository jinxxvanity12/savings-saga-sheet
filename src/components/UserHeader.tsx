
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import UserMenuHeader from './UserMenuHeader';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut } from 'lucide-react';

const UserHeader = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignOutClick = () => {
    logout();
    navigate('/login');
  };

  if (currentUser) {
    return (
      <div className="flex items-center gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSignOutClick}
          className="text-destructive border-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </Button>
        <UserMenuHeader />
      </div>
    );
  }

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleLoginClick}
      className="ml-auto"
    >
      <LogIn className="h-4 w-4 mr-2" />
      Sign In
    </Button>
  );
};

export default UserHeader;
