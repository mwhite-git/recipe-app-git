import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

/**
 * Updates the role of a user in the Firestore database.
 * @param {string} userId - The UID of the user to update.
 * @param {string} newRole - The new role to assign to the user (e.g., 'admin', 'premium').
 */
export const updateUserRole = async (userId, newRole) => {
  try {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      role: newRole
    });
    console.log(`User role updated to ${newRole}`);
  } catch (error) {
    console.error("Error updating user role:", error);
  }
};

