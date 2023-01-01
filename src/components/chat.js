import React, { useState, useEffect, useRef } from "react";
import { Avatar, Input, MessageBox } from 'react-chat-elements';
import moment from 'moment';
import 'moment/locale/es';
import "react-chat-elements/dist/main.css";
import "../App.css"
import { AiOutlineSend, AiOutlineCheck } from "react-icons/ai";
import { CgAttachment } from "react-icons/cg";
import { BsMegaphone } from "react-icons/bs";

moment.locale("es");

let websocket = "";
let inputReferance = React.createRef();
let inputFile = React.createRef();
let messages = [];


const Chat = (props) => {
    const { fromUser, fromUserUuid, fromUserName, fromUserAvatar, toUser, toUserUuid } = props.selectedUser;
    const [textMessage, setTextMessage] = useState('');
    const [loadedMessages, setLoadedMessages] = useState(false);
    const messageScroll = useRef(null);
    const [refresh, setRefresh] = useState(false);


    //se agrega el listener para el auto scroll to the bottom.
    useEffect(() => {
        if (messageScroll) {
            messageScroll.current.addEventListener('DOMNodeInserted', event => {
                const { currentTarget: target } = event;
                target.scroll({ top: target.scrollHeight, behavior: 'smooth' });
            });
        }
    }, [])


    //componentDidMount
    useEffect(() => {
        //cmd ipconfig - IPv4 Address
        //dev ws://IPv4 Address:8080/${fromUser.UserPhone} 
        if (fromUser !== undefined) {
            websocket = WebSocketMaker(`ws://192.168.1.101:8080/${fromUser}`);
        }

        //console.log(websocket, "websocket");
        //console.log(fromUser, "fromUser Chat");
        //console.log(toUser, "toUser Chat");

    }, [fromUser])


    //componentDidUpdate
    useEffect(() => {
        setRefresh(false);
    }, [refresh]);


    useEffect(() => {
        messages = [];
        setRefresh(true);
    }, [toUser])


    //componentWillUnmount
    useEffect(() => {
        return () => {
            if (websocket !== "") {
                websocket.close();
                messages = [];
            }
        }
    }, [fromUser])



    // genera un Uuid
    const getUniqueID = () => {
        const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
        return s4() + s4() + '-' + s4();
    };

    //metodo que construye el socket
    const WebSocketMaker = (webSocketServer) => {

        const ws = new WebSocket(webSocketServer, 'echo-protocol');

        ws.onopen = () => {
            console.log('WebSocket Client Connected');
            if (ws.readyState === WebSocket.OPEN) {
                console.log("onopen");
                //let message = { type: "utf8", broadcast: "user", from: "3012997085", to: "3012997086", utf8Data: "message from web" };
                //ws.send(JSON.stringify(message));
            }
        };

        ws.onmessage = (e) => {
            let item = JSON.parse(e.data);
            console.log(item, "onmessage item");
            //console.log(item.chatItem, "onmessage chatItem");

            if (item.chatItem.retracted !== undefined) {

                messages.find(message => {
                    if (message.id === item.chatItem.id) {
                        //console.log(message, "message");
                        message.text = "Eliminaste este mensaje."
                        message.retracted = item.chatItem.retracted;
                    }
                });

            } else if (item.chatItem.status === "read") {

                messages.find(message => {
                    if (message.id === item.chatItem.id) {
                        //console.log(message, "message");
                        message.status = item.chatItem.status;
                    }
                });

                setRefresh(true);

            } else {

                let message = {
                    id: item.chatItem.id,
                    avatar: item.chatItem.avatar,
                    position: item.chatItem.position,
                    reply: item.chatItem.reply,
                    type: item.chatItem.type,
                    title: item.chatItem.title,
                    text: item.chatItem.text,
                    date: new Date(),
                    data: item.chatItem.data,
                    retracted: item.chatItem.retracted,
                    status: "received",
                }

                messages.push(message);



            }

            setRefresh(true);
            console.log(messages, "onmessage");

        };

        ws.onerror = (e) => {
            console.log("onerror: ", e);
        };

        ws.onclose = (e) => {
            console.log('WebSocket Client Closed');
            //console.log(e.code, e.reason);
        };

        return ws;
    }


    //metodo que verifica que el socket este en estado open para enviar mensajes.
    const WebSocketMessage = (type, broadcast, webSocketMessage, chatItem) => {
        if (websocket.readyState === WebSocket.OPEN) {
            let message = { type: type, broadcast: broadcast, from: fromUser, to: broadcast !== "all" ? toUser : "all", utf8Data: webSocketMessage, chatItem: chatItem };
            //console.log(message, "websocket message");
            websocket.send(JSON.stringify(message));
        }
    }

    //metodo que construye los mensaje del chat dependiendo del messagetype: text - image - audio - video
    //tambien los envia al socket y los guarda en el sistema.
    const messageMaker = async (messagetype, messageText, mediaUri, broadcast = 'user') => {
        let message = {};

        if (messagetype === "text") {

            message = {
                id: getUniqueID(),
                avatar: fromUserAvatar,
                position: "left",
                type: "text",
                title: fromUserName,
                text: messageText,
                date: new Date(),
                data: {},
                status: "sent",
            }

            messages.push(message);
            setRefresh(true);
            console.log(messages, "messageMaker messages");
            /* 
                        let payload = {
                            toUUID: toUserUuid,
                            fromUUID: fromUserUuid,
                            text: messageText
                        } */


            //let result = await textMessages(payload);
            //console.log(result, "messageMaker textMessages");

            // message = chatItem
            WebSocketMessage("utf8", broadcast, messageText, message);

        } else if (messagetype === "photo" || messagetype === "audio" || messagetype === "video") {

            // TODO las imagenes de deben alojar en un servidor para obtener la url y que esta sea la uri del mensaje
            message = {
                id: getUniqueID(),
                avatar: fromUserAvatar,
                position: "left",
                type: messagetype,
                text: messageText,
                date: new Date(),
                data: {
                    uri: mediaUri,
                    status: {
                        click: false,
                        loading: 0,
                    },
                },
                status: "sent",
            }


            messages.push(message);

            WebSocketMessage("utf8", broadcast, "", message);

        }

    }



    const onSendAll = () => {

        if (textMessage !== "") {
            messageMaker("text", textMessage, "", "all");
            setRefresh(true);
            inputClear();
        }
    }


    const onSend = () => {

        if (textMessage !== "") {
            messageMaker("text", textMessage, "");
            setRefresh(true);
            inputClear();
        }
    }

    const onChatInputChange = (text) => {
        setTextMessage(text.target.value);
    }


    const inputClear = () => {
        setTextMessage("");
        inputReferance.current.value = "";
    }


    const onDownload = (message) => {
        const link = document.createElement('a');
        link.href = message.data.uri;
        link.setAttribute(
            'download',
            `${moment(new Date()).format('DD-MM-YYYY')}.png`,
        );

        // Append to html link element page
        document.body.appendChild(link);

        // Start download
        link.click();

        // Clean up and remove the link
        link.parentNode.removeChild(link);
        inputFile.current.value = "";

    }

    const onChangeFilePicker = (file) => {
        if (fromUserAvatar !== undefined) {
            messageMaker("photo", `${moment(new Date()).format('DD-MM-YYYY')}.png`, URL.createObjectURL(file));
            setRefresh(true);

        } else {
            inputFile.current.value = "";
            alert('Debes seleccionar un contacto.');
        }
    }

    const onReply = (message) => {
        console.log(message, "message");
        let reply = prompt('Digite su respuesta.');
        let replyObj = {
            photoURL: fromUserAvatar,
            title: message.title,
            titleColor: "#8717ae",
            message: reply,

        }
        message.reply = replyObj;
        WebSocketMessage("utf8", "user", "", message);
        setRefresh(true);
        //console.log(reply, "reply");
    }


    const onRetracted = (message) => {
        message.text = "Eliminaste este mensaje."
        message.retracted = true;
        console.log(message, "onRetracted");
        WebSocketMessage("utf8", "user", "", message);
        setRefresh(true);
    }



    const onReadMessage = (message) => {
        if (message.status === "received") {
            message.status = "read";
            WebSocketMessage("utf8", "user", "", message);
            setRefresh(true);
        }
    }


    const onRead = async () => {

        messages.find(message => {
            if (message.status === "received") {
                message.status = "read";
                WebSocketMessage("utf8", "user", "", message);
            }
        });

        setRefresh(true);
    }



    return (
        <div style={{ display: "flex", flexDirection: "column", width: "100%", height: "100vh" }}>
            <div style={{
                display: "flex", flexDirection: "row", alignItems: "center", height: "8vh",
                borderWidth: 1,
                borderColor: "gray",
                borderStyle: "solid"
            }}>
                <div style={{ margin: 15 }}>
                    {
                        fromUserAvatar !== undefined ?
                            <Avatar
                                src={fromUserAvatar}
                                alt="avatar"
                                size="medium"
                                type="circle"
                            />
                            :
                            <span>Selecciona un contacto </span>
                    }
                </div>
                <div style={{ margin: 10 }}>
                    <span style={{ fontSize: 25 }}>{fromUserName}</span>
                </div>
            </div>
            <div ref={messageScroll} style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "scroll", overflowX: "hidden" }}>
                {
                    !refresh &&
                    messages.map((message, index) => {
                        return (
                            <div key={index} style={{ margin: 10 }}>
                                <MessageBox
                                    onClick={() => onReadMessage(message)}
                                    avatar={message.avatar}
                                    reply={message.reply}
                                    position={message.avatar === fromUserAvatar ? "left" : "right"}
                                    type={message.type}
                                    title={message.title}
                                    text={message.text}
                                    date={message.date}
                                    data={message.data !== {} ? message.data : {}}
                                    replyButton={true}
                                    onReplyClick={() => onReply(message)}
                                    onRemoveMessageClick={() => onRetracted(message)}
                                    removeButton={message.type !== "photo" ? true : false}
                                    onDownload={() => onDownload(message)}
                                    retracted={message.retracted}
                                    status={message.status}
                                />
                            </div>
                        );
                    })
                }
            </div>


            <div style={{ alignSelf: "flex-end", width: "100%", borderWidth: 1, borderColor: "gray", borderStyle: "solid" }}>
                <Input
                    referance={inputReferance}
                    inputStyle={{}}
                    onKeyPress={(e) => {
                        if (e.key === "Enter") {
                            onSend();
                        }
                    }}
                    onChange={text => onChatInputChange(text)}
                    placeholder="Mensaje"
                    multiline={false}
                    rightButtons={[
                        <button style={{ cursor: "pointer", backgroundColor: 'transparent', border: "none", color: "blue", display: fromUserAvatar !== undefined ? "" : "none" }} onClick={() => onSend()}>
                            <AiOutlineSend size={25} />
                        </button>,

                        fromUserAvatar !== undefined ?
                            <div className="image-upload">
                                <label htmlFor="file-input" style={{ color: "blue", cursor: "pointer" }}>
                                    <CgAttachment size={25} />
                                </label>
                                <input
                                    id="file-input"
                                    type="file"
                                    style={{ borderRadius: 20 }}
                                    ref={inputFile}
                                    onChange={(e) => onChangeFilePicker(e.target.files[0])}
                                />
                            </div>
                            :
                            null,
                        //se agrego temporalmente mientras se agrega el endpoint de cargar mensajes para agregar esta funcionalidad junto con la carga de usuarios
                        <button style={{ cursor: "pointer", backgroundColor: 'transparent', border: "none", color: "blue", display: fromUserAvatar !== undefined ? "" : "none" }} onClick={() => onRead()} >
                            <AiOutlineCheck size={25} />
                        </button>,
                        <button style={{ cursor: "pointer", backgroundColor: 'transparent', border: "none", color: "blue", display: fromUserAvatar !== undefined ? "" : "none" }} onClick={() => onSendAll()}>
                            <BsMegaphone size={25} />
                        </button>,
                    ]}
                />

            </div>

        </div >
    );

}

export default Chat