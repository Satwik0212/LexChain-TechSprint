import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../services/firebase';
import { onAuthStateChanged, signOut as firebaseSignOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            console.log("Auth state changed:", currentUser?.email);

            if (currentUser) {
                // If user is logged in, you might want to fetch extra data from Firestore
                // For now, we trust the Auth object, but let's try to get profile
                try {
                    const userDocRef = doc(db, "users", currentUser.uid);
                    const userSnap = await getDoc(userDocRef);
                    if (userSnap.exists()) {
                        setUserData(userSnap.data());
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
                setUser(currentUser);
            } else {
                setUser(null);
                setUserData(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    const logout = async () => {
        try {
            await firebaseSignOut(auth);
            setUser(null);
            setUserData(null);
        } catch (error) {
            console.error("Logout failed", error);
        }
    };

    const value = {
        user,
        userData,
        loading,
        logout,
        setUser // Exposing this to allow manual override for Dev Bypass
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
