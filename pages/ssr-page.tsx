import React from 'react';

const SSRPage = ({ message }: { message: string }) => {
  return (
    <div>
      <h1>Server-Side Rendered Page</h1>
      <p>{message}</p>
    </div>
  );
};

export default SSRPage;

export async function getServerSideProps() {
    // Fetch data on the server side, this is where you make API calls or access databases
    const message = "Hello from the server! This page was rendered on the server.";
  
    // Pass the fetched data to the page component via props
    return {
      props: {
        message, // This gets passed to the SSRPage component as a prop
      },
    };
  }
  