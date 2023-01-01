import { useState, useEffect } from "react";
import ChatCard from '../components/chatCard';
import Chat from '../components/chat';


const ChatList = () => {
    const [chatUsers, setChatUsers] = useState([{
        fromUser: "3012997085",
        fromUserUuid: "111111111",
        fromUserName: "test 1",
        fromUserAvatar: "https://repomassimagenes.sfo3.digitaloceanspaces.com/e-hunter/media/2022/06/06/2022-06-06_19-12-02_rn_image_picker_lib_temp_1f5dbc57-b24f-4881-9065-3f894d2ca27e.jpg",
        toUser: "3012997086",
        toUserUuid: "222222222"
    },
    {
        fromUser: "3012997086",
        fromUserUuid: "3333333333",
        fromUserName: "test 2",
        fromUserAvatar: "https://avatars.githubusercontent.com/u/80540635?v=4",
        toUser: "3012997085",
        toUserUuid: "4444444444"
    },
    {
        fromUser: "3012997087",
        fromUserUuid: "5555555555",
        fromUserName: "test 3",
        fromUserAvatar: "https://avatars.githubusercontent.com/u/80540635?v=4",
        toUser: "3012997085",
        toUserUuid: "66666666666"
    }]);
    const [filterchatUsers, setFilterChatUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState([]);
    const [search, setSearch] = useState("");
    const [refresh, setRefresh] = useState(false);

    //componentDidMount
    useEffect(() => {
        // Your code here
    }, []);


    //componentDidUpdate
    useEffect(() => {
        setRefresh(false);
    }, [refresh]);


    useEffect(() => {
        const timer = setTimeout(() => {
            filterChatUsers()
        }, 500)

        return () => clearTimeout(timer)
    }, [search])


    const getSelectedUser = (user) => {
        console.log(user, "user SelectedUser");
        setSelectedUser(user);
    }


    const onChangeSearch = (event) => {
        setSearch(event.target.value);
    }


    const filterChatUsers = () => {
        let filtered = chatUsers.filter(item => item.fromUserName.toLowerCase().includes(search.toLowerCase()));
        setFilterChatUsers(filtered);
    }



    return (
        <div style={{ display: "flex", flexDirection: "row", flex: 1 }}>
            <div style={{ display: "flex", flexDirection: "column", flex: 0.5 }}>
                <div>
                    <div style={{
                        height: "8vh",
                        borderWidth: 1,
                        borderLeftColor: "gray",
                        borderRightColor: "gray",
                        borderColor: "gray",
                        borderStyle: "solid",
                    }}>
                        <input style={{ width: "96%", height: "75%", border: 'none', backgroundColor: "#f8f8f8", padding: "7px", cursor: "pointer" }} placeholder='Filtrar chat' value={search} onChange={(event) => onChangeSearch(event)} />
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "scroll", overflowX: "hidden", height: "92vh" }}>
                        {
                            (filterchatUsers.length === 0 && chatUsers.length > 0) ?
                                chatUsers.map((user, index) => {
                                    return (
                                        <div style={{}}>
                                            <ChatCard user={user} getSelectedUser={() => getSelectedUser(user)} />
                                        </div>
                                    );

                                })
                                :
                                filterchatUsers.map((user, index) => {
                                    return (
                                        <div style={{}}>
                                            <ChatCard user={user} getSelectedUser={() => getSelectedUser(user)} />
                                        </div>
                                    );

                                })
                        }

                    </div>
                </div>
            </div>
            <div style={{ display: "flex", flex: 0.8 }}>
                {
                    !refresh &&
                    < Chat selectedUser={selectedUser} />
                }
            </div>
        </div>
    );

}

export default ChatList