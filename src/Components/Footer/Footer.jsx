import React from "react";

export const Footer = () => {
  return (
    <footer className="mt-20 bg-transparent border-t border-blue-800 text-white py-6">
      <div className="text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} Minflash. All Rights Reserved.
        </p>
        <p className="text-sm">Aradhya Sharma</p>
      </div>
    </footer>
  );
};
