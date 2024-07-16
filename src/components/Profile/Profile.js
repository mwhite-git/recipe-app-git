import React, { useState, useEffect } from 'react';
import { auth, db, storage } from '../../firebase'; // Ensure you have storage imported
import { updateProfile, EmailAuthProvider, reauthenticateWithCredential, updatePassword, deleteUser } from 'firebase/auth';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import './Profile.css';

const Profile = () => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [bio, setBio] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [profilePicUrl, setProfilePicUrl] = useState('');
  const [notificationPref, setNotificationPref] = useState('email');
  const [socialLinks, setSocialLinks] = useState({ twitter: '', facebook: '' });
  const [activityLog, setActivityLog] = useState([]);
  const [recipesCount, setRecipesCount] = useState(0);
  const [recipeStats, setRecipeStats] = useState({ mostFavorited: '', mostViewed: '' });
  const [achievements, setAchievements] = useState([]);

  const user = auth.currentUser;

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (user) {
        setEmail(user.email);
        setDisplayName(user.displayName || '');

        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setBio(userData.bio || '');
          setProfilePicUrl(userData.profilePicUrl || '');
          setNotificationPref(userData.notificationPref || 'email');
          setSocialLinks(userData.socialLinks || { twitter: '', facebook: '' });
          setActivityLog(userData.activityLog || []);
          setRecipesCount(userData.recipesCount || 0);
          setRecipeStats(userData.recipeStats || { mostFavorited: '', mostViewed: '' });
          setAchievements(userData.achievements || []);
        }
      }
    };

    fetchUserProfile();
  }, [user]);

  const handleUpdateProfile = async () => {
    if (user) {
      await updateProfile(user, { displayName });
      await updateDoc(doc(db, 'users', user.uid), {
        displayName,
        bio,
        notificationPref,
        socialLinks,
      });
      if (profilePic) {
        const storageRef = ref(storage, `images/${user.uid}/profilePic`);
        await uploadBytes(storageRef, profilePic);
        const downloadURL = await getDownloadURL(storageRef);
        await updateDoc(doc(db, 'users', user.uid), { profilePicUrl: downloadURL });
        setProfilePicUrl(downloadURL);
      }
      alert('Profile updated successfully');
    }
  };

  const handleChangePassword = async () => {
    if (newPassword === confirmPassword) {
      const credential = EmailAuthProvider.credential(email, password);
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
      alert('Password changed successfully');
    } else {
      alert('Passwords do not match');
    }
  };

  const handleDeleteAccount = async () => {
    const credential = EmailAuthProvider.credential(email, password);
    await reauthenticateWithCredential(user, credential);
    await deleteUser(user);
    alert('Account deleted successfully');
  };

  const handleProfilePicChange = (e) => {
    if (e.target.files[0]) {
      setProfilePic(e.target.files[0]);
    }
  };

  if (!user) {
    return <p>Loading...</p>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <img src={profilePicUrl || 'default-profile-pic-url'} alt="Profile" />
        <h2>{displayName || 'User'}</h2>
        <p>{email}</p>
      </div>
      <div className="profile-section">
        <label>Display Name:</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
      </div>
      <div className="profile-section">
        <label>Profile Picture:</label>
        <input type="file" onChange={handleProfilePicChange} />
      </div>
      <div className="profile-section">
        <label>Bio:</label>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
        />
      </div>
      <div className="profile-section">
        <label>Notification Preferences:</label>
        <select
          value={notificationPref}
          onChange={(e) => setNotificationPref(e.target.value)}
        >
          <option value="email">Email</option>
          <option value="sms">SMS</option>
          <option value="none">None</option>
        </select>
      </div>
      <div className="profile-section">
        <label>Social Media Links:</label>
        <input
          type="text"
          placeholder="Twitter"
          value={socialLinks.twitter}
          onChange={(e) => setSocialLinks({ ...socialLinks, twitter: e.target.value })}
        />
        <input
          type="text"
          placeholder="Facebook"
          value={socialLinks.facebook}
          onChange={(e) => setSocialLinks({ ...socialLinks, facebook: e.target.value })}
        />
      </div>
      <div className="profile-section">
        <label>Current Password:</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <label>New Password:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <label>Confirm New Password:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
        />
        <button onClick={handleChangePassword}>Change Password</button>
      </div>
      <div className="profile-section">
        <button onClick={handleDeleteAccount}>Delete Account</button>
      </div>
      <div className="profile-section">
        <button onClick={handleUpdateProfile}>Update Profile</button>
      </div>
      <div className="profile-section">
        <p>Total Recipes: {recipesCount}</p>
      </div>
      <div className="activity-log">
        <h3>Activity Log</h3>
        <ul>
          {activityLog.map((activity, index) => (
            <li key={index}>{activity}</li>
          ))}
        </ul>
      </div>
      <div className="recipe-stats">
        <h3>Recipe Statistics</h3>
        <p>Most favorited recipe: {recipeStats.mostFavorited}</p>
        <p>Most viewed recipe: {recipeStats.mostViewed}</p>
      </div>
      <div className="achievements">
        <h3>Achievements</h3>
        <ul>
          {achievements.map((achievement, index) => (
            <li key={index}>{achievement}</li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Profile;
