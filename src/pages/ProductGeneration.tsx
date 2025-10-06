import React, { useState } from 'react';

const ProductGeneration = () => {
  const [prompt, setPrompt] = useState('');
  const [link, setLink] = useState('');

  const handleChangePrompt = value => setPrompt(value);
  const handleChangeLink = value => setLink(value);

  const handleSubmit = e => {
    e.preventDefault();
    setLink('');
    setPrompt('');
    console.log(prompt);
    console.log(link);
  };

  return (
    <div className="flex flex-col justify-center items-center mt-5 mb-12">
      <h1 className="text-3xl p-5">Product Generation</h1>
      <form
        onSubmit={handleSubmit}
        className="flex flex-col justify-center items-center gap-3"
      >
        <input
          type="text"
          name="prompt"
          placeholder="Prompt"
          minLength={3}
          value={prompt}
          onChange={event => handleChangePrompt(event.target.value)}
          className="p-2 border rounded w-[90vw] md:w-[50vw]"
        />
        <input
          type="text"
          name="link"
          placeholder="Link"
          minLength={3}
          value={link}
          onChange={event => handleChangeLink(event.target.value)}
          className="p-2 border rounded w-[90vw] md:w-[50vw]"
        />
        <button className="w-[50vw] md:w-[30vw] bg-green-600 rounded p-2">
          GENERATE
        </button>
      </form>
    </div>
  );
};

export default ProductGeneration;
