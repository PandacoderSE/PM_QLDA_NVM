import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white text-sm">
      <div className="container mx-auto py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">Head office</h3>
            <p>Add: Nhổn, Minh Khai, Từ Liêm, Hà Nội
            </p>
            <p>Tel: +84-(0)85-260 8689</p>
            <p>Fax: +84-(0)24-375 6591</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact :</h3>
            <p>Add mail: nmaxsoftcompany@gmail.com</p>
            <p>Tel: +84-2817-8974</p>
            <p>Fax: +84-2810-8475</p>
          </div>
          <div>
            <h3 className="text-lg font-semibold mb-4">Browser compatible</h3>
            <p> Version 12.0.742.53 Google Chrome</p>
            <p> Version 58.0.1  Mozilla Firefox</p>
            <p> Version 11.0.9600.18617  Microsoft Edge</p>
            <p> Version 5.1.7 Safari</p>
          </div>
        </div>
      </div>
      <div className="bg-orange-500 text-center py-4">
        <p>&copy;NMAXSOFT Co.Ltd. All Rights Reserved.</p>
      </div>
    </footer>
  );
}

export default Footer;
