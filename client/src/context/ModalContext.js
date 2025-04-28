// src/context/ModalContext.js
import React, { createContext, useState } from 'react';

export const ModalContext = createContext();

export const ModalProvider = ({ children }) => {
     const [loginModalOpen, setLoginModalOpen] = useState(false);
     const [registerModalOpen, setRegisterModalOpen] = useState(false);
     const [advertiseModalOpen, setAdvertiseModalOpen] = useState(true);

     const toggleLoginModal = () => {
          setLoginModalOpen((prev) => !prev);
     };

     const toggleRegisterModal = () => {
          setRegisterModalOpen((prev) => !prev);
     };

     const openRegisterFromLogin = () => {
          setLoginModalOpen(false);
          setRegisterModalOpen(true);
     };

     const openLoginFromRegister = () => {
          setRegisterModalOpen(false);
          setLoginModalOpen(true);
     };

     const closeAdvertiseModal = () => {
          setAdvertiseModalOpen(false);
          localStorage.setItem("showAdvertisement", false);
          console.log("Advertise modal closed");
     }
     

     return (
          <ModalContext.Provider
               value={{
                    loginModalOpen,
                    registerModalOpen,
                    toggleLoginModal,
                    toggleRegisterModal,
                    openRegisterFromLogin,
                    openLoginFromRegister,
                    closeAdvertiseModal,
                    advertiseModalOpen,
                    setAdvertiseModalOpen,
               }}
          >
               {children}
          </ModalContext.Provider>
     );
};
