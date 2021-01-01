import React from "react";

const Linebreak = ({ color }) => {
    return (
        <hr
            style={{
                color: color,
                backgroundColor: color,
                height: 5
            }}
        />
    );
}

export default Linebreak;