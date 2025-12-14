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

export type GIFToSend = {
    url: string;
    id: string;
    title: string;
}

export type UserMessage = {
    Message: string;
    Message_Type: string;
    GIF_URL?: string;
    Viewed: boolean;
    Message_Id: string;
    Author: string;
}