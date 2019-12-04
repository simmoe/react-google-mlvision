import React from 'react'

const Label = (props) => {
    console.log(props.label)
    return(
        <div className="similar">
            {
                <h2>{props.label.description}</h2>
            }
        </div>
    )
} 
export default Label

