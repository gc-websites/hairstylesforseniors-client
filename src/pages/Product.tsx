import React, { useEffect, useState } from 'react';

const Product = () => {
  const params = new URLSearchParams(window.location.search);
  const fbclid = params.get('fbclid');
  const url = window.location.href;
  const id = url.split('/').pop();
  const [productData, setProductData] = useState({});
  const [clickId, setClickId] = useState('');
  const [urlWithSubtag, setUrlWithSubtag] = useState('');

  useEffect(() => {
    try {
      fetch(`https://dev.nice-advice.info/get-product/${id}`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'GET',
      })
        .then(res => {
          if (!res.ok) {
            throw new Error('Failed to fetch products');
          }
          return res.json();
        })
        .then(data => {
          setProductData(data.data);
        });
    } catch (err) {
      console.error('❌ Error:', err);
    }
  }, []);

  useEffect(() => {
    if (fbclid) {
      try {
        fetch(`https://dev.nice-advice.info/get-product/ads/${id}`, {
          headers: { 'Content-Type': 'application/json' },
          method: 'POST',
          body: JSON.stringify({ fbclid: fbclid }),
        })
          .then(res => {
            if (!res.ok) {
              throw new Error('Failed to fetch products');
            }
            return res.json();
          })
          .then(data => {
            setClickId(data.data);
          });
      } catch (err) {
        console.error('❌ Error:', err);
      }
    }
  }, []);

  useEffect(() => {
    if (productData && clickId) {
      setUrlWithSubtag(productData?.link + `&subtag08-20=${clickId}`);
      console.log(urlWithSubtag);
    }
  }, [clickId, productData]);

  return (
    <div className="flex flex-col justify-center items-center p-5">
      <img
        id="cta-image"
        src={productData?.image?.url}
        onClick={() => window.open(urlWithSubtag, '_blank')}
        className="w-[90vw] md:w-[40vw] rounded-xl cursor-pointer transition-transform duration-300 ease-in-out hover:-translate-y-2 hover:shadow-xl"
      />
      <h1 className="text-2xl md:text-3xl text-center font-bold w-[90%]">
        {productData?.title}
      </h1>
      <h2 className="text-xl text-center font-bold text-red-400">
        Up to 50% OFF
      </h2>
      <p className="w-[90%] md:w-[40%]">{productData?.descriptionfield1}</p>
      <p className="w-[90%] md:w-[40%]">{productData?.descriptionfield2}</p>
      <p className="w-[90%] md:w-[40%]">{productData?.descriptionfield3}</p>
      <p className="w-[90%] md:w-[40%]">{productData?.descriptionfield4}</p>
      <button
        id="cta-btn"
        className="w-[90vw] md:w-[40vw] p-5 m-5 rounded bg-[rgb(3,145,133)] text-2xl font-bold relative bg-[#eaa31e] border border-black rounded-lg py-[15px] px-[20px] mb-[10px] flex justify-center items-center cursor-pointer transition-colors duration-300 font-bold overflow-hidden text-[17px] hover:bg-[#c47f00]
          before:content-[''] before:absolute before:top-[-150%] before:left-[-150%] before:w-full before:h-[50%] before:bg-[rgba(255,255,255,0.3)] before:-rotate-45 before:animate-myshine font-inter"
        onClick={() => window.open(urlWithSubtag, '_blank')}
      >
        VIEW ON AMAZON
      </button>
      <p className="border p-2 md:w-[40vw]">
        Editorial Note: We independently review all products. If you make a
        purchase through our links, we may receive a commission
      </p>
    </div>
  );
};

export default Product;
