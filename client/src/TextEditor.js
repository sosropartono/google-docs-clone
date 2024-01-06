import React from 'react'
import {useEffect, useCallback, useState} from "react"
import Quill from 'quill'
import "quill/dist/quill.snow.css"
import {io} from 'socket.io-client'
import {useParams} from 'react-router-dom'


const SAVE_INTERVAL = 2000

var toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
    ['blockquote', 'code-block'],
  
    [{ 'header': 1 }, { 'header': 2 }],               // custom button values
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
    [{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
    [{ 'direction': 'rtl' }],                         // text direction
  
    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
  
    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
    [{ 'font': [] }],
    [{ 'align': [] }],
  
    ['clean']                                         // remove formatting button
  ];

export default function TextEditor() {
    const [socket, setSocket] = useState()
    const [quill, setQuill] = useState()
    const {id: documentId} = useParams()

    console.log(documentId)



    useEffect(() => {
        if (socket == null || quill == null) return

        const interval = setInterval(() => {
            socket.emit('save-document', quill.getContents())

        }, SAVE_INTERVAL)

        return () => {
            clearInterval(interval)
        }

    }, [socket, quill])
    useEffect(() => {
        if (socket != null || quill == null) return

        socket.once('load-document', document => {
            quill.setContents(document)
            quill.enable()
        })

        socket.emit('get-document', documentId)
    },[socket, quill, documentId])
    // client side places the server url; server places client side url
    useEffect(() => {

        const s = io("http://localhost:3001")
        setSocket(s)

        return () => {
            s.disconnect()
        }
    }, [])


    // Set up for the other client
    useEffect(() => {
        if (socket == null || quill == null) return 
            const handler = (delta, oldDelta, source) => {
                quill.updateContents(delta)
            }
            socket.on('receive-changes',handler)
    
            return () => {
                socket.off('receive-changes', handler )
            }
        }, [socket, quill])

    // Changes based on user
    useEffect(() => {
        if (socket == null || quill == null) return 
        const handler = (delta, oldDelta, source) => {
            if (source !== 'user') return
            socket.emit("send-changes", delta)
        }
        quill.on('text-change',handler)

        return () => {
            quill.off('text-change', )
        }
    }, [socket, quill])

    const wrapperRef = useCallback((wrapper) => {
        if(wrapper == null) return
        wrapper.innerHTML = ''
        const editor = document.createElement('div')
        wrapper.append(editor)
        const q = new Quill(editor, {theme: 'snow', modules: {toolbar: toolbarOptions}})
        q.enable(false)
        q.disable()
        q.setText('Loading...')
        setQuill(q)
    }, [])
  return (
    <div className="container" ref={wrapperRef}>
        
    </div>
  )
}
