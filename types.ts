export type UserDataType = {
    Username: string;
    Id: string;
    Unread_Messages: number;
    Online: boolean;
    Last_Message: string;
}

export type NotificationType = {
    Sender: string;
    Recipient: string;
    Request_Id: string;
    Create_Time: Date;
    Message: string;
}