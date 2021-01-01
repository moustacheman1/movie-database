import React from "react";

const Switch = function () {
    return (
        <div className="custom-control custom-switch">
            <input
                type="checkbox"
                className="custom-control-input"
                id="customSwitch"
                readOnly
            />
            <label className="custom-control-label" htmlFor="customSwitch">
                Toggle this switch element
            </label>
        </div>
    );
}

export default Switch;