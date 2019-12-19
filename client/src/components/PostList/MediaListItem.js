import React from 'react'
import { useHistory } from 'react-router-dom'
import slugify from 'slugify'
import './styles.css'

const MediaListItem = props => {
    const { media, clickMedia, deleteMedia, editMedia } = props
    const history = useHistory()

    const handleClickMedia = media => {
        const slug = slugify(media.title, { lower: true} )

        clickMedia(media)
        history.push(`/medias/${slug}`)
    }

    const handleEditMedia = media => {
        editMedia(media)
        history.push(`/edit-media/${media._id}`)
    }

    return (
        <div>
            <div className="mediaListItem" onClick={() => handleClickMedia(media)}>
            <h1>{media.title}</h1>
            <p>{media.creator}</p>
            <p>{media.type}</p>
            <p>{media.units}</p>
            <p>{media.progress}</p>
            <p>{media.unitType}</p>
            </div>
            <div className="mediaControls">
                <button onClick={() => deleteMedia(media)}>Delete</button>
                <button onClick={() => handleEditMedia(media)}>Edit</button>
            </div>
        </div>
    )
}

export default MediaListItem