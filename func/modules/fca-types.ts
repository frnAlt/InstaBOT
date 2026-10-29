import type { ReadableStream } from "stream/web";

export interface FCALianeAPI {
  /**
   * Adds a user (or array of users) to a group chat.
   */
  addUserToGroup(
    userID: FCAID,
    threadID: FCAID,
    callback?: commonCallback
  ): Promise<void>;

  /**
   * Given a adminID, or an array of adminIDs, will set the admin status of the user(s) to adminStatus.
   */
  changeAdminStatus(
    threadID: FCAID,
    adminIDs: FCAID[],
    adminStatus: boolean,
    callback?: commonCallback
  ): Promise<void>;

  /**
   * Given a threadID, or an array of threadIDs, will set the archive status of the threads to archive. Archiving a thread will hide it from the logged-in user's inbox until the next time a message is sent or received.
   */
  changeArchivedStatus(
    threadOrThreads: FCAID[],
    archive: boolean,
    callback?: commonCallback
  ): Promise<void>;

  /**
   * Prevents a user from privately contacting you. (Messages in a group chat will still be seen by both parties).
   */
  changeBlockedStatus(
    userID: FCAID,
    block: boolean,
    callback?: commonCallback
  ): Promise<void>;

  /**
   * Will change the group chat's image to the given image.
   */
  changeGroupImage(
    image: ReadableStream,
    threadID: FCAID,
    callback?: commonCallback
  ): Promise<void>;

  /**
   * Will change the thread user nickname to the one provided.
   */
  changeNickname(
    nickname: string,
    threadID: FCAID,
    participantID: FCAID,
    callback?: commonCallback
  ): Promise<void>;

  /**
   * Will change the thread color to the given hex string color ("#0000ff"). Set it to empty string if you want the default.
   */
  changeThreadColor(
    color: ThreadColors,
    threadID: FCAID,
    callback?: commonCallback
  ): Promise<void>;

  /**
   * Will change the thread emoji to the one provided.
   *
   * Note: The UI doesn't play nice with all emoji.
   */
  changeThreadEmoji(
    emoji: string,
    threadID: FCAID,
    callback?: (err: Error | null) => void
  ): Promise<void>;

  /**
   * Create a new group chat.
   */
  createNewGroup(
    participantIDs: FCAID[],
    groupTitle?: string,
    callback?: (err: Error | null, threadID: FCAID) => void
  ): Promise<void>;

  /**
   * Takes a messageID or an array of messageIDs and deletes the corresponding message.
   */
  deleteMessage(
    messageOrMessages: FCAID | FCAID[],
    callback?: (err: Error | null) => void
  ): Promise<void>;

  /**
   * Given a threadID, or an array of threadIDs, will delete the threads from your account.
   * Note that this does not remove the messages from Facebook's servers – anyone who hasn't deleted the thread can still view all of the messages.
   */
  deleteThread(
    threadOrThreads: FCAID | FCAID[],
    callback?: (err: Error | null) => void
  ): Promise<void>;

  /**
   * Edit your sent messages.
   * Note: This will only work if the message is sent by you and was sent less than 15 minutes ago.
   */
  editMessage(
    body: string,
    messageID: FCAID,
    callback?: (err: Error | null) => void
  ): Promise<void>;

  /**
   * Forwards the corresponding attachment to the given userID or to every user from an array of userIDs.
   */
  forwardAttachment(
    attachmentID: string,
    userOrUsers: FCAID | FCAID[],
    callback?: (err: Error | null) => void
  ): Promise<void>;

  /**
   * Returns current appState which can be saved to a file or stored in a variable.
   */
  getAppState(): any[];

  /**
   * Returns the currently logged-in user's Facebook user ID.
   */
  getCurrentUserID(): string;

  /**
   * Returns the URL to a Facebook Messenger-style emoji image asset.
   *
   * Note: This function will return a URL regardless of whether the image at the URL actually exists.
   * This can happen if, for example, Messenger does not have an image asset for the requested emoji.
   *
   */
  getEmojiUrl(
    c: string,
    size: 32 | 64 | 128,
    pixelRatio: "1.0" | "1.5" | "1.0"
  ): string;

  /**
   * Returns an array of objects with some information about your friends.
   *
   */
  getFriendsList(callback: (err: Error | null, arr: Friend[]) => void): void;

  /**
   * Takes a threadID, number of messages, a timestamp, and a callback to get a thread's message history.
   *
   */
  getThreadHistory(
    threadID: FCAID,
    amount: number,
    timestamp: number | undefined,
    callback: (error: Error | null, history: Message[]) => void
  ): void;

  /**
   * Takes a threadID and a callback. Works for both single-user and group threads.
   */
  getThreadInfo(
    threadID: FCAID,
    callback?: (err: Error | null, info: ThreadInfo) => void
  ): Promise<ThreadInfo>;

  /**
   * Fetches a list of the user's threads.
   */
  getThreadList(
    limit: number,
    timestamp: number | null,
    tags: ("INBOX" | "ARCHIVED" | "PENDING" | "OTHER")[],
    callback?: (err: Error | null, list: ThreadListItem[]) => any
  ): Promise<ThreadListItem[]>;

  /**
   * Takes a threadID, an offset to specify the starting index for retrieving pictures, a limit for how many pictures to retrieve, and a callback to return the result.
   *
   */
  getThreadPictures(
    threadID: FCAID,
    offset: number,
    limit: number,
    callback?: (
      err: Error | null,
      arr: { uri: string; width: number; height: number }[]
    ) => any
  ): Promise<{ uri: string; width: number; height: number }[]>;

  /**
   * Performs a Facebook Graph search given a name (which could be for a user, page, group, event, or app),
   * and returns all corresponding IDs ordered by Facebook's ranking.
   */
  getUserID(
    name: string,
    callback?: (
      err: Error | null,
      obj: {
        userID: FCAID;
        photoUrl: string;
        indexRank: number;
        name: string;
        isVerified: boolean;
        profileUrl: string;
        category: string;
        score: number;
        type: "user" | "group" | "page" | "event" | "app";
      }[]
    ) => any
  ): Promise<
    {
      userID: FCAID;
      photoUrl: string;
      indexRank: number;
      name: string;
      isVerified: boolean;
      profileUrl: string;
      category: string;
      score: number;
      type: "user" | "group" | "page" | "event" | "app";
    }[]
  >;

  /**
   * Retrieves information about the given users.
   */
  getUserInfo(
    ids: FCAID | FCAID[],
    callback?: (err: Error | null, obj: { [key: string]: UserInfo }) => any
  ): Promise<{ [key: string]: UserInfo }>;

  threadColors: Record<string, ThreadColors>;

  /**
   * Accepts or ignores message requests with the specified threadID(s).
   */
  handleMessageRequest(
    threadID: FCAID | FCAID[],
    accept: boolean,
    callback?: (error: Error | null) => any
  ): Promise<void>;

  /**
   * Logs out the current user.
   */
  logout(callback: (error: Error | null) => void): Promise<void>;

  /**
   * Marks the given message as delivered in the specified thread.
   * This tells Facebook's servers that the message has been received.
   * You can also automatically mark messages as delivered. This is enabled by default in the options.
   * @deprecated
   */
  markAsDelivered(
    threadID: FCAID,
    messageID: FCAID,
    callback?: (error: Error | null) => any
  ): Promise<void>;

  /**
      * Marks all unread messages in a given thread as read.
      *
      * Facebook will take a couple of seconds to show that the messages are marked as read.
      * You can also automatically mark new messages as read. Be cautious, as this could result in your account being banned,
      * especially when receiving a huge amount of messages.
 @deprecated
    */
  markAsRead(
    threadID: FCAID,
    read?: boolean,
    callback?: (error: Error | null) => any
  ): Promise<void>;

  /**
      * Marks all messages in the user's inbox as read.
 
    */
  markAsReadAll(callback?: (err: Error | null) => void): Promise<void>;

  /**
   * Marks the user's entire inbox as seen.
   * Note that this is different from marking messages as read.
   * @deprecated
   */
  markAsSeen(
    seenTimestamp?: number,
    callback?: (err: Error | null) => any
  ): Promise<void>;

  /**
      * Mutes or unmutes a chat for a given period of time.
 
    */
  muteThread(
    threadID: FCAID,
    muteSeconds: number,
    callback?: (err: Error | null) => any
  ): Promise<void>;

  /**
 * Removes a user from a group chat.
 *
 
 */
  removeUserFromGroup(
    userID: FCAID,
    threadID: FCAID,
    callback?: (err: any) => any
  ): Promise<void>;

  /**
 * Resolves the URL to the full-size photo given its ID.
 * Useful for retrieving the full-size photo URL of image attachments in messages.
 
 */
  resolvePhotoUrl(
    photoID: FCAID,
    callback?: (err: any, url: string) => any
  ): Promise<void>;

  /**
 * Searches for threads by a given name (chat title).
 * This function is outdated and is referenced by #396.
 
 */
  searchForThread(
    name: string,
    callback?: (err: any, obj: any) => any
  ): Promise<void>;

  /**
   * Sends the given message to the specified thread.
   *
   * @param message - The message to send. Can be a string or a message object.
   * @param threadID - The ID of the thread to send the message to. This can be a string, number, or array of user IDs.
   * @param callback - An optional callback called when the sending operation is done. It receives an error (if any) and message information.
   * @param messageID - An optional string representing the ID of a message you want to reply to.
   * @returns A Promise that resolves once the operation is complete.
   */
  sendMessage(
    message: MessageForm,
    threadID: FCAID | FCAID[],
    callback?: (
      err: any,
      messageInfo: { threadID: FCAID; messageID: FCAID; timestamp: number }
    ) => void,
    messageID?: FCAID | undefined
  ): Promise<{
    threadID: FCAID;
    messageID: FCAID;
    timestamp: number;
  } | void>;

  /**
   * Sends the given message to the specified thread.
   *
   * @param message - The message to send. Can be a string or a message object.
   * @param threadID - The ID of the thread to send the message to. This can be a string, number, or array of user IDs.
   * @param messageID - An optional string representing the ID of a message you want to reply to.
   * @returns A Promise that resolves once the operation is complete.
   */
  sendMessage(
    message: MessageForm,
    threadID: FCAID | FCAID[],
    messageID?: FCAID | undefined
  ): Promise<{
    threadID: FCAID;
    messageID: FCAID;
    timestamp: number;
  } | void>;

  /**
 * Sends a "USERNAME is typing" indicator to other members of the thread.
 * The indicator disappears after 30 seconds or when the end function is called.
 
 */
  sendTypingIndicator(
    threadID: FCAID,
    callback?: (err: any) => any
  ): Promise<void>;

  /**
   * Sets a reaction on a message.
   *
   * @param reaction - A string containing an emoji, unicode, or emoji shortcut.
   * If the string is empty (""), it will remove the reaction.
   * @param messageID - The ID of the message you want to set the reaction on.
   * @param callback - An optional callback that is called when the reaction is done.
   * @param forceCustomReaction - Optional flag to force using a custom emoji (not recommended for general use).
   * @returns A Promise that resolves when the operation is complete.
   */
  setMessageReaction(
    reaction: emojiTypes,
    messageID: FCAID,
    callback?: (err: any) => void,
    forceCustomReaction?: boolean
  ): Promise<void>;

  /**
   * Sets various configurable options for the api.
   */
  setOptions(options: ApiOptions): Promise<void>;

  /**
   * Sets the title of the group chat with thread id threadID to newTitle.
   */
  setTitle(
    newTitle: string,
    threadID: FCAID,
    callback?: (err: any, obj: any) => any
  ): Promise<void>;

  /**
     * Revokes a message from anyone that could see that message with messageID
 
Note: This will only work if the message is sent by you and was sent less than 10 minutes ago.
     */
  unsendMessage(messageID: FCAID, callback?: (err: any) => any): Promise<void>;

  listenMqtt(
    callback: (
      error: Error | null,
      event: Record<string, any>
    ) => any | Promise<any>
  ): void;

  /**
   * @deprecated
   */
  listen: FCALianeAPI["listenMqtt"];

  [K: string | number | symbol]: any;
}

export type commonCallback = (err: Error | Object) => any;
/**
 * Interface for configuring options for the API.
 */
export interface ApiOptions {
  logLevel?:
    | "silly"
    | "verbose"
    | "info"
    | "http"
    | "warn"
    | "error"
    | "silent";
  selfListen?: boolean;
  selfListenEvent?: boolean;
  listenTyping?: boolean;
  listenEvents?: boolean;
  pageID?: string;
  updatePresence?: boolean;
  forceLogin?: boolean;
  userAgent?: string;
  autoMarkDelivery?: boolean;
  autoMarkRead?: boolean;
  proxy?: string;
  online?: boolean;
  autoReconnect?: boolean;
  emitReady?: boolean;
  bypassRegion?: string;
}
/**
 * A type representing the possible emoji reactions.
 * This includes both emoji Unicode characters and their corresponding shortcuts.
 */

export type emojiTypes =
  | "\uD83D\uDE0D"
  | "\uD83D\uDE06"
  | "\uD83D\uDE2E"
  | "\uD83D\uDE22"
  | "\uD83D\uDE20"
  | "\uD83D\uDC4D"
  | "\uD83D\uDC4E"
  | "\u2764"
  | "\uD83D\uDC97"
  | ""
  | ":love:"
  | ":haha:"
  | ":wow:"
  | ":sad:"
  | ":angry:"
  | ":like:"
  | ":dislike:"
  | ":heart:"
  | ":glowingheart:"
  | string;

/**
 * A dictionary mapping names of all currently valid thread themes to their theme ID.
 * These themes are used for selecting thread colors in the Messenger client.
 */
export type ThreadColors =
  | 196241301102133
  | 169463077092846
  | 2442142322678320
  | 234137870477637
  | 980963458735625
  | 175615189761153
  | 2136751179887052
  | 2058653964378557
  | 2129984390566328
  | 174636906462322
  | 1928399724138152
  | 417639218648241
  | 930060997172551
  | 164535220883264
  | 370940413392601
  | 205488546921017;
export interface ThreadListItem {
  threadID: FCAID;
  name: string;
  unreadCount: number;
  messageCount: number;
  imageSrc: string | null;
  emoji: string | null;
  color: string | null;
  nicknames: { userid: string; nickname: string }[];
  muteUntil: number | null;
  participants: ParticipantInfo[];
  adminIDs: FCAID[];
  folder: "INBOX" | "ARCHIVED" | "PENDING" | "OTHER";
  isGroup: boolean;
  customizationEnabled: boolean;
  participantAddMode: "ADD" | null;
  reactionsMuteMode: "REACTIONS_NOT_MUTED" | "REACTIONS_MUTED";
  mentionsMuteMode: "MENTIONS_NOT_MUTED" | "MENTIONS_MUTED";
  isArchived: boolean;
  isSubscribed: boolean;
  timestamp: number;
  snippet: string;
  snippetAttachments: Attachment[];
  snippetSender: FCAID;
  lastMessageTimestamp: number;
  lastReadTimestamp: number | null;
  cannotReplyReason: string | null;
  approvalMode: boolean;
}
export interface ParticipantInfo {
  accountType:
    | "User"
    | "Page"
    | "UnavailableMessagingActor"
    | "ReducedMessagingActor";
  userID: FCAID;
  name: string;
  shortName: string;
  gender: "MALE" | "FEMALE" | "NEUTER" | "UNKNOWN";
  url: string | null;
  profilePicture: string;
  username: string | null;
  isViewerFriend: boolean;
  isMessengerUser: boolean;
  isVerified: boolean;
  isMessageBlockedByViewer: boolean;
  isViewerCoworker: boolean;
}
export interface Attachment {
  type: string;
  url: string;
  filename: string;
  [key: string]: any;
}
export interface ThreadInfo {
  threadID: FCAID;
  participantIDs: FCAID[];
  threadName: string;
  userInfo: UserInfo[];
  nicknames: { [key: string]: string } | null;
  unreadCount: number;
  messageCount: number;
  imageSrc: string | null;
  timestamp: number;
  muteUntil: number | null;
  isGroup: boolean;
  isSubscribed: boolean;
  folder: "inbox" | "archive";
  isArchived: boolean;
  cannotReplyReason: string | null;
  lastReadTimestamp: number;
  emoji: { emoji: string } | null;
  color: string;
  adminIDs: { id: FCAID }[];
  approvalMode: boolean;
  approvalQueue: ApprovalQueueItem[];
}
export interface UserInfo {
  id: FCAID;
  name: string;
  firstName: string;
  vanity?: string;
  thumbSrc: string;
  profileUrl: string;
  gender: "male" | "female" | "other";
  type: "user" | "group" | "page" | "event" | "app";
  isFriend: boolean;
  isBirthday: boolean;
  searchTokens: string[];
  alternateName?: string;
}
export interface ApprovalQueueItem {
  inviterID: FCAID;
  requesterID: FCAID;
  timestamp: number;
}

export interface Friend {
  alternateName: string;
  firstName: string;
  gender: string;
  userID: FCAID;
  isFriend: boolean;
  fullName: string;
  profilePicture: string;
  type: string;
  profileUrl: string;
  vanity: string;
  isBirthday: boolean;
}

export type Message = FCAMqtt.MqttMessage & {
  timestamp: string;
};

export interface FCAAppstate {
  expires?: string | number | Date;
  key: string;
  value: string;
  domain: string;
  path: string;
  hostOnly?: boolean;
  creation?: string;
  lastAccessed?: string;
}

export type Mention = {
  tag: string;
  id: FCAID;
  fromIndex: number;
};
export type StrictMessageForm = {
  emoji?: any;
  emojiSize?: null;
  sticker?: any;
  url?: any;
  body?: string;
  attachment?: ReadableStream | ReadableStream[] | any | any[];
  mentions?: Mention[];
  location?: { latitude: number; longitude: number; current: boolean };
};
export type MessageForm = string | StrictMessageForm;
export type FCAID = string | number;

export namespace FCAMqtt {
  export interface TypingEvent {
    type: "typ";
    isTyping: boolean;
    from: string;
    threadID: string;
  }

  export interface PresenceEvent {
    type: "presence";
    userID: string;
    timestamp: number;
    statuses: any;
  }

  export interface MessageEvent {
    type: "message";
    senderID: string;
    body: string;
    threadID: string;
    messageID: string;
    attachments: any[];
    mentions: Record<string, string>;
    timestamp: number;
    isGroup: boolean;
    args?: string[];
    participantIDs?: string[];
  }

  export interface MessageReactionEvent {
    type: "message_reaction";
    threadID: string;
    messageID: string;
    reaction: string;
    senderID: string;
    userID: string;
  }

  export interface MessageUnsendEvent {
    type: "message_unsend";
    threadID: string;
    messageID: string;
    senderID: string;
    deletionTimestamp: number;
    timestamp: number;
  }

  export interface MessageReplyEvent {
    type: "message_reply";
    threadID: string;
    messageID: string;
    senderID: string;
    attachments: any[];
    args: string[];
    body: string;
    isGroup: boolean;
    mentions: Record<string, string>;
    timestamp: string;
    participantIDs: string[];
    messageReply?: MessageEvent;
  }

  export interface ThreadImageChangeEvent {
    type: "change_thread_image";
    threadID: string;
    snippet: string;
    timestamp: string;
    author: string;
    image: {
      attachmentID?: string;
      width?: number;
      height?: number;
      url?: string;
    };
  }

  export interface ReadyEvent {
    type: "ready";
    error: null;
  }

  export interface ErrorEvent {
    type: "stop_listen" | "parse_error";
    error: string;
    detail?: any;
    res?: any;
  }

  export type MqttMessage =
    | TypingEvent
    | PresenceEvent
    | MessageEvent
    | MessageReactionEvent
    | MessageUnsendEvent
    | MessageReplyEvent
    | ThreadImageChangeEvent
    | ReadyEvent
    | ErrorEvent;
}
