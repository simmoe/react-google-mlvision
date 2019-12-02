import React from 'react'

const Similar = (props) => {

    const addDefaultSrc = (e) => {
        e.target.style.display = 'none'
    }
        return(
        <div className="similar">
            {
                <img onError={addDefaultSrc} src={props.image.url} alt={props.image.url} />
            }
        </div>
    )
} 
export default Similar

