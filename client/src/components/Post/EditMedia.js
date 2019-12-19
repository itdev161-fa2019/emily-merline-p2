import React, { useState } from 'react'
import axios from 'axios'
import { useHistory } from 'react-router-dom'
import './styles.css'

const EditMedia = ({ token, media, onMediaUpdated }) => {
    let history = useHistory()
    const [mediaData, setMediaData] = useState({
        title: media.title,
        creator: media.body,
        type: media.type,
        units: media.units,
        progress: media.progress,
        unitType: media.unitType
    })
    const { title, creator, type, units, progress, unitType } = mediaData
    
    const onChange = e => {
        const { name, value } = e.target 

        setMediaData({
            ...mediaData,
            [name]: value
        })
    }

    const update = async () => {
        if (!title || !creator || !type || !units || !progress || !unitType) {
            console.log('All fields are required')
        } else {
            const newMedia = {
                title: title,
                creator: creator,
                type: type,
                units: units,
                progress: progress,
                unitType: unitType
            }

            try {
                const config = {
                    headers: {
                        'Content-Type': 'application/json',
                        'x-auth-token': token
                    }
                }

                const body = JSON.stringify(newMedia)
                const res = await axios.put(
                    `/api/medias/${media._id}`,
                    body,
                    config
                )

                onMediaUpdated(res.data)
                history.push('/')
            } catch (error) {
                console.error(`Error creating media: ${error.response.data}`)
            }
        }
    }

    return (
        <div className="form-container">
            <h2>Edit Media</h2>
            <input
            name="title"
            type="text"
            placeholder="Title"
            value={title}
            onChange={e => onChange(e)}
            />
            <input
            name="creator"
            type="text"
            placeholder="Creator"
            value={creator}
            onChange={e => onChange(e)}
            />
            <input
            name="type"
            type="text"
            placeholder="Type"
            value={type}
            onChange={e => onChange(e)}
            />
            <input
            name="units"
            type="text"
            placeholder="Units"
            value={units}
            onChange={e => onChange(e)}
            />
            <input
            name="progress"
            type="text"
            placeholder="Progress"
            value={progress}
            onChange={e => onChange(e)}
            />
            <input
            name="unitType"
            type="text"
            placeholder="Unit Type"
            value={unitType}
            onChange={e => onChange(e)}
            />
            <button onClick={() => update()}>Submit</button>
        </div>
    )
}

export default EditMedia