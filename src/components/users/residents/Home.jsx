import React from "react";

const Home = () => {
  return (
    <div>
      <h1>Home Page</h1>
      <div className="flex flex-col justify-center items-center h-screen bg-gray-100 text-center">
        <h1 className="text-3xl font-bold text-gray-800">
          We'll Be Back Soon!
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Our website is currently undergoing maintenance.
        </p>
        <p className="mt-2 text-lg text-gray-600">
          We appreciate your patience.
        </p>
        <p className="mt-4 text-lg text-gray-600">Please check back later.</p>
      </div>
    </div>
  );
};

export default Home;
