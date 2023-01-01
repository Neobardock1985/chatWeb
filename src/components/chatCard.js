import React, { useState, useEffect } from 'react';
import { ChatItem } from "react-chat-elements";
import "react-chat-elements/dist/main.css";


const ChatCard = (props) => {
    const { fromUser, fromUserUuid, fromUserName, fromUserAvatar, toUser, toUserUuid } = props.user;

    //componentDidMount
    useEffect(() => {

    }, [])

    return (
        <div style={{
            paddingHorizontal: 5,
            paddingVertical: 30, cursor: "pointer",
        }} onClick={() => props.getSelectedUser()}>
            <ChatItem
                avatar={fromUserAvatar}
                alt={fromUserName}
                title={fromUserName}
                date={new Date()}
                unread={0}
            />
        </div >
    );

};


export default ChatCard;