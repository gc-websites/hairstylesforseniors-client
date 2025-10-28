import React from 'react';

const EmailForm = ({ handleFormClose }) => {
  return (
    <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] bg-gray-500 border rounded py-5 md:p-5 md:w-[40vw] md:h-[80vh] flex justify-center items-center flex-col gap-2 md:gap-5">
      <h1 className="text-3xl md:text-4xl">Feedback-Form</h1>
      <div className="flex flex-col w-[80%] md:w-[70%]">
        <label>Name</label>
        <input className="rounded p-2" />
      </div>
      <div className="flex flex-col w-[80%] md:w-[70%]">
        <label>Email</label>
        <input className="rounded p-2" />
      </div>
      <div className="flex flex-col w-[80%] md:w-[70%]">
        <label>Your request</label>
        <textarea className="resize-none h-[150px] p-2 rounded"></textarea>
      </div>
      <div className="flex w-[80%] md:w-[70%] justify-around">
        <button className="border rounded p-3 bg-green-800">Send</button>
        <button
          className="border rounded p-3 bg-red-900"
          onClick={handleFormClose}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default EmailForm;
