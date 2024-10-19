import dynamic from 'next/dynamic';
import React, { useEffect, useState } from 'react';
import QuillImageDropAndPaste from 'quill-image-drop-and-paste';
import { base64StringToBlob } from 'blob-util';
import 'react-quill/dist/quill.snow.css';
import axios from 'axios';


// Dynamically import ReactQuill to ensure it's only loaded on the client side
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

// Custom Components for Toolbar
const CustomHeart = () => <span>♥</span>;
const Paste = () => <span>+</span>;

// Handlers and Functions
function insertHeart() {
    const cursorPosition = this.quill.getSelection().index;
    this.quill.insertText(cursorPosition, '♥', {
        color: '#000000',
        italic: true,
    });
    this.quill.setSelection(cursorPosition + 1);
}

function hexColor(value) {
    let color;
    if (!value.startsWith('rgb(')) {
        color = value;
    } else {
        color = value
            .replace(/^[^\d]+/, '')
            .replace(/[^\d]+$/, '')
            .split(',')
            .map((component) => `00${parseInt(component, 10).toString(16)}`.slice(-2))
            .join('');
    }
    this.quill.format('color', color);
}

function imageHandler(imageDataUrl, type, imageData) {
    if (!type) type = 'image/png';

    // let blob = base64StringToBlob(
    //     imageDataUrl.replace(/^data:image\/\w+;base64,/, ''),
    //     type
    // );

    // let filename = [
    //     'my',
    //     'cool',
    //     'image',
    //     '-',
    //     Math.floor(Math.random() * 1e12),
    //     '-',
    //     new Date().getTime(),
    //     '.',
    //     type.match(/^image\/(\w+)$/i)[1],
    // ].join('');

    // var formData = new FormData();
    // formData.append('filename', filename);
    // formData.append('file', blob);

    // const index = (this.quill.getSelection() || {}).index || this.quill.getLength();
    // this.quill.insertEmbed(index, 'image', imageDataUrl, 'user');

    const originalFile = imageData.toFile();
    imageData.minify({
        maxWidth: 320,
        maxHeight: 320,
        quality: .7
    }).then((miniImageData) => {
        const blob = miniImageData.toBlob();
        const file = miniImageData.toFile();

        console.log(`type: ${type}`)
        console.log(`dataUrl: ${imageDataUrl}`)
        console.log(
            `compressed file size: ${file.size * 1e-3} KB, original file size: ${originalFile.size * 1e-3} KB`
        )

        const formData = new FormData();
        // upload the image which has less size
        formData.append('file', file.size < originalFile.size ? file : originalFile);
        axios.post('/api/upload', formData, {
            headers: {
                'content-type': 'multipart/form-data',
            },
            onUploadProgress: (event) => {
                console.log(`Current progress:`, Math.round((event.loaded * 100) / event.total));
            },
        }).then((res) => {
            console.log('upload response: ', res.data);
            const imageUrl = res.data.data[0].url; // Adjust this according to your response structure
            console.log(imageUrl)

            // Insert the image into the Quill editor
            const range = (this.quill.getSelection() || {}) || this.quill.getLength();
            this.quill.insertEmbed(range.index, 'image', imageUrl, 'user');
            this.quill.setSelection(range.index + 1)    // Move the cursor after the inserted image
        }).catch((err) => {
            console.error('upload error: ', err);
        });
    })
}

// Custom Toolbar
const CustomToolbar = () => (
    <div id="toolbar">
        <select className="ql-font" defaultValue="arial">
            <option value="arial">Arial</option>
            <option value="comic-sans">Comic Sans</option>
            <option value="courier-new">Courier New</option>
            <option value="georgia">Georgia</option>
            <option value="helvetica">Helvetica</option>
            <option value="lucida">Lucida</option>
        </select>
        <select className="ql-size" defaultValue="medium">
            <option value="extra-small">Size 1</option>
            <option value="small">Size 2</option>
            <option value="medium">Size 3</option>
            <option value="large">Size 4</option>
        </select>
        <select className="ql-align" />
        <select className="ql-color" />
        <select className="ql-background" />
        <button className="ql-clean" />
        <button className="ql-imageHandler">
            <Paste />
        </button>
        <button className="ql-insertHeart">
            <CustomHeart />
        </button>
    </div>
);
// Editor Component
const Editor = ({ placeholder }) => {
    const [editorHtml, setEditorHtml] = useState('');

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const Quill = require('quill');
            const Size = Quill.import('formats/size');
            Size.whitelist = ['extra-small', 'small', 'medium', 'large'];
            Quill.register(Size, true);

            const Font = Quill.import('formats/font');
            Font.whitelist = [
                'arial',
                'comic-sans',
                'courier-new',
                'georgia',
                'helvetica',
                'lucida',
            ];
            Quill.register(Font, true);

            Quill.register('modules/imageDropAndPaste', QuillImageDropAndPaste);
        }
    }, []);

    const modules = {
        toolbar: {
            container: '#toolbar',
            handlers: {
                insertHeart: insertHeart,
                color: hexColor,
            },
        },
        imageDropAndPaste: {
            handler: imageHandler,
        },
    };

    const formats = [
        'header',
        'font',
        'size',
        'bold',
        'italic',
        'underline',
        'strike',
        'blockquote',
        'list',
        'bullet',
        'indent',
        'link',
        'image',
        'color',
    ];

    console.log(editorHtml)

    return (
        <div className="text-editor">
            <CustomToolbar />
            <ReactQuill
                value={editorHtml}
                onChange={setEditorHtml}
                placeholder={placeholder}
                modules={modules}
                formats={formats}
            />
        </div>
    );
};

export default Editor;
