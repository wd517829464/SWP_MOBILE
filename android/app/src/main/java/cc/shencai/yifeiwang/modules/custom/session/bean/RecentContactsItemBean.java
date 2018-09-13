package cc.shencai.yifeiwang.modules.custom.session.bean;

import com.netease.nimlib.sdk.msg.constant.MsgStatusEnum;
import com.netease.nimlib.sdk.msg.constant.MsgTypeEnum;
import com.netease.nimlib.sdk.msg.constant.SessionTypeEnum;

/**
 * Created by woshi on 2017-06-27.
 */

public class RecentContactsItemBean {

	/**
	 * contactId : p_48679892512998180
	 * content : Hello world！Hello 云信开发者。我是你在云信Demo上的第一个好友。如果还没添加其他好友进行消息收发测试，那就发给我试试吧！
	 * fromAccount : p_48679892512998180
	 * fromNick : 默认好友
	 * msgStatus : success
	 * msgType : text
	 * recentMessageId : ccd62adc-4039-4922-9cfc-93d65852f1f0
	 * sessionType : P2P
	 * tag : 0
	 * time : 1498186621596
	 * unreadCount : 0
	 */

	private String contactId;
	private String content;
	private String fromAccount;
	private String fromNick;
	private MsgStatusEnum msgStatus;
	private MsgTypeEnum msgType;
	private String recentMessageId;
	private SessionTypeEnum sessionType;
	private long tag;
	private long time;
	private int unreadCount;
	private long createTime;//
	private String noticeContent;
	private String senderName;
	private boolean isHasRead;


	public void setCreateTime(long createTime){
		this.createTime = createTime;
	}

	public long getCreateTime(){
		return createTime;
	}

	public void setNoticeContent(String noticeContent){
		this.noticeContent = noticeContent;
	}

	public String getNoticeContent(){
		return noticeContent;
	}

	public void setSenderName(String senderName){
		this.senderName = senderName;
	}

	public String getSenderName(){
		return senderName;
	}

	public void setIsHasRead(boolean isHasRead){
		this.isHasRead = isHasRead;
	}

	public boolean getIsHasRead(){
		return isHasRead;
	}

	public String getContactId() {
		return contactId;
	}

	public void setContactId(String contactId) {
		this.contactId = contactId;
	}

	public String getContent() {
		return content;
	}

	public void setContent(String content) {
		this.content = content;
	}

	public String getFromAccount() {
		return fromAccount;
	}

	public void setFromAccount(String fromAccount) {
		this.fromAccount = fromAccount;
	}

	public String getFromNick() {
		return fromNick;
	}

	public void setFromNick(String fromNick) {
		this.fromNick = fromNick;
	}

	public MsgStatusEnum getMsgStatus() {
		return msgStatus;
	}

	public void setMsgStatus(MsgStatusEnum msgStatus) {
		this.msgStatus = msgStatus;
	}

	public MsgTypeEnum getMsgType() {
		return msgType;
	}

	public void setMsgType(MsgTypeEnum msgType) {
		this.msgType = msgType;
	}

	public String getRecentMessageId() {
		return recentMessageId;
	}

	public void setRecentMessageId(String recentMessageId) {
		this.recentMessageId = recentMessageId;
	}

	public SessionTypeEnum getSessionType() {
		return sessionType;
	}

	public void setSessionType(SessionTypeEnum sessionType) {
		this.sessionType = sessionType;
	}

	public long getTag() {
		return tag;
	}

	public void setTag(long tag) {
		this.tag = tag;
	}

	public long getTime() {
		return time;
	}

	public void setTime(long time) {
		this.time = time;
	}

	public int getUnreadCount() {
		return unreadCount;
	}

	public void setUnreadCount(int unreadCount) {
		this.unreadCount = unreadCount;
	}
}
