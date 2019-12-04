import React from 'react'

const Similar = (props) => {

    return(
        <div className="similar">
            {
                <img onError={() => props.takeMeAway(props.image.url) } src={props.image.url} alt={props.image.url} />
            }
        </div>
    )
} 
export default Similar

