import React from 'react'
import MediaListItem from './MediaListItem'


const MediaList = props => {
    const { medias, clickMedia, deleteMedia, editMedia } = props
    return medias.map(media => (
        <MediaListItem
        key={media._id}
        media={media}
        clickMedia={clickMedia}
        deleteMedia={deleteMedia}
        editMedia={editMedia}
        />
    ))
}

export default MediaList