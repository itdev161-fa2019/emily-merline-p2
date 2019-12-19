import React from 'react'

const Media = props => {
    const { media } = props

    return (
        <div>
            <h1>{media.title}</h1>
            <p>{media.creator}</p>
            <p>{media.type}</p>
            <p>{media.units}</p>
            <p>{media.progress}</p>
            <p>{media.unitType}</p>
        </div>
    )
}

export default Media