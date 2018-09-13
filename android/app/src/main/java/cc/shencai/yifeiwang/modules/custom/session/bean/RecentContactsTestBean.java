package cc.shencai.yifeiwang.modules.custom.session.bean;

/**
 * Created by woshi on 2017-06-27.
 */

public class RecentContactsTestBean {

	/**
	 * contactId : 57439166
	 * content : [文件]
	 * fromAccount : 18684013019
	 * fromNick : 王绍春
	 * msgStatus : success
	 * msgType : file
	 * recentMessageId : c83f1f17fbc34314a5acf7b39d21c2d6
	 * sessionType : Team
	 * tag : 0
	 * time : 1498536443355
	 * unreadCount : 0
	 */

	private String contactId;
	private String content;
	private String fromAccount;
	private String fromNick;
	private String msgStatus;
	private String msgType;
	private String recentMessageId;
	private String sessionType;
	private int tag;
	private long time;
	private int unreadCount;

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

	public String getMsgStatus() {
		return msgStatus;
	}

	public void setMsgStatus(String msgStatus) {
		this.msgStatus = msgStatus;
	}

	public String getMsgType() {
		return msgType;
	}

	public void setMsgType(String msgType) {
		this.msgType = msgType;
	}

	public String getRecentMessageId() {
		return recentMessageId;
	}

	public void setRecentMessageId(String recentMessageId) {
		this.recentMessageId = recentMessageId;
	}

	public String getSessionType() {
		return sessionType;
	}

	public void setSessionType(String sessionType) {
		this.sessionType = sessionType;
	}

	public int getTag() {
		return tag;
	}

	public void setTag(int tag) {
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
