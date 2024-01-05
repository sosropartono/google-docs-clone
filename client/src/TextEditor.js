import React from 'react'
import {useEffect, useCallback} from "react"
import Quill from 'quill'
import "quill/dist/quill.snow.css"

export default function TextEditor() {

    const wrapperRef = useCallback((wrapper) => {
        const editor = document.createElement('div')
        wrapperRef.current.append(editor)
        new Quill(editor, {theme: 'snow'})
        return () => {
            wrapperRef.innerHTML = ""
        }

    }, [])
  return (
    <div id="container" ref={wrapperRef}>
        
    </div>
  )
}
