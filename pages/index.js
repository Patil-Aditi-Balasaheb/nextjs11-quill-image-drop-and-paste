import dynamic from 'next/dynamic';
import Head from 'next/head';

// Dynamically load the Editor component to avoid SSR issues
const Editor = dynamic(() => import('./components/Editor'), { ssr: false });

export default function Home() {
  return (
    <div className="custom-toolbar-example">
      <Head>
        <title>Custom Toolbar with React Quill</title>
      </Head>
      <h3>Custom Toolbar with React Quill (Next.js Version)</h3>
      <Editor placeholder={'Write something or insert a heart ♥'} />
    </div>
  );
}
