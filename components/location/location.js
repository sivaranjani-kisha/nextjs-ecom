'use client';
import React from 'react';

const branches = [
  {
    title: 'BOSCH BRAND STORE 2',
    address: '142/1, NEAR BY SAKTHI MAHAL, PALAYAMPALAYAM BUS STOP, PERUNDURAI MAIN ROAD, EROD - 63801',
    phone: '6384000330',
    email: 'bea.eym13.com',
  },
  {
    title: 'KUNIYAMUTHUR',
    address: '6/75-4 Palakkad Main Road, Edayarpalayam Pirivu, Kuniyamuthur Post, Land mark - Opposite Dennis Department Store, COIMBATORE - 6410081',
    phone: '9865248608',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
  {
    title: 'CORPORATE OFFICE',
    address: '26/1 Dr.ALAGAPPA CHETTIYAR ROAD,TATABAD, NEAR KOVAI SCAN CENTRE, COIMBATORE - 641012',
    phone: '042224912228',
    email: 'bea.eym13.com',
  },
];

export default function LocationPage() {
  return (
    <div className="min-h-screen bg-white py-12 px-4 md:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-customBlue mb-10">Our Branches</h1>

        {/* Branch Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {branches.map((branch, idx) => (
            <div
              key={idx}
              className="border border-blue-300 rounded-lg shadow-sm p-4 hover:shadow-md transition"
            >
              <h2 className="text-md font-semibold text-gray-800 mb-2">{branch.title}</h2>
              <p className="text-sm text-gray-700 mb-1">{branch.address}</p>
              <p className="text-sm text-gray-700 mb-1">Phone: {branch.phone}</p>
              <p className="text-sm text-blue-600">{branch.email}</p>
            </div>
          ))}
        </div>
        <div className="mb-10 w-full h-[400px]">
  <iframe
    src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3911.9092186355943!2d76.95661931480073!3d11.016844292153897!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3ba85c3b8336cfd1%3A0xa329b2d72a9e92ee!2sCoimbatore%2C%20Tamil%20Nadu!5e0!3m2!1sen!2sin!4v1647442610000!5m2!1sen!2sin"
    width="100%"
    height="100%"
    style={{ border: 0 }}
    allowFullScreen=""
    loading="lazy"
    referrerPolicy="no-referrer-when-downgrade"
  ></iframe>
</div>

      </div>
    </div>
  );
}
