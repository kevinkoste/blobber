import Head from "next/head";
import styles from "../styles/Home.module.css";

import { useState, useEffect } from "react";
import { useUpload } from "@blobber/react";

process.env.BLOBBER_CLIENT_ID = "J1UPK5Z6JV6A2180";

export default function Home() {
  const { handleUpload, file, preview: previewUrl } = useUpload();

  const [imageUrl, setImageUrl] = useState("/vercel.svg");

  useEffect(() => {
    // as soon as the user selects an image,
    // change the image url to the preview
    if (previewUrl) {
      console.log(previewUrl);

      setImageUrl(previewUrl);
    }
  }, [previewUrl]);

  useEffect(() => {
    // once the file is uploaded, save file.id to your api
    // you'll use this to serve the image in the next step
    if (file) {
      // api.post("/user", { photoId: file.id });
      // you may also want to hint that the upload succeeded
      alert("file uploaded!");
    }
  }, [file]);

  return (
    <div className={styles.container}>
      <Head>
        <title>Create Next App</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        <h1 className={styles.title}>
          Welcome to <a href="https://nextjs.org">Next.js!</a>
        </h1>

        <input type="file" onChange={handleUpload} />

        <img src={imageUrl} width={200} />
      </main>

      <footer className={styles.footer}>
        <a
          href="https://vercel.com?utm_source=create-next-app&utm_medium=default-template&utm_campaign=create-next-app"
          target="_blank"
          rel="noopener noreferrer"
        >
          Powered by{" "}
          <img src="/vercel.svg" alt="Vercel Logo" className={styles.logo} />
        </a>
      </footer>
    </div>
  );
}
