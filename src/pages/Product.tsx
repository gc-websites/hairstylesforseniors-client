import React from 'react';

const Product = () => {
  return (
    <div className="flex flex-col justify-center items-center p-5">
      <img
        src="https://homeaddict.ca/wp-content/uploads/2025/09/ai-generated-1758549078-1.png"
        className="w-[90vw] md:w-[50vw] rounded-xl cursor-pointer"
      />
      <h1 className="text-2xl md:text-3xl text-center font-bold">
        Unbeatable Deals on Women's Puffer Jackets!
      </h1>
      <h2 className="text-2xl text-center font-bold text-red-400">
        Up to 50% OFF
      </h2>
      <p className="md:text-xl p-1">
        🧥 Stay Warm + Stylish: Puffer jackets with ultimate comfort.
      </p>
      <p className="md:text-xl p-1">
        💰 Hot Deals: Save big — but only for a limited time!
      </p>
      <p className="md:text-xl p-1">
        🌆 Versatile Wear: Perfect for chilly walks or city nights 🙂
      </p>
      <p className="md:text-xl p-1">
        👉 Grab your puffer jacket today — comfort, style & savings in one!
      </p>
      <button className="w-[90vw] md:w-[50vw] p-5 m-5 rounded bg-[rgb(3,145,133)] text-2xl font-bold">
        VIEW ON AMAZON
      </button>
    </div>
  );
};

export default Product;
