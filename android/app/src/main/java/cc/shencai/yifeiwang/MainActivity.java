package cc.shencai.yifeiwang;

import android.support.annotation.NonNull;

import com.facebook.react.ReactActivity;
import com.netease.nim.uikit.permission.MPermission;

public class MainActivity extends ReactActivity {

    /**
     * Returns the name of the main component registered from JavaScript.
     * This is used to schedule rendering of the component.
     */
    @Override
    protected String getMainComponentName() {
        return "AwesomeProject";
    }

    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, @NonNull int[] grantResults) {
        MPermission.onRequestPermissionsResult(this, requestCode, permissions, grantResults);
    }

//	@Override
//	public void onBackPressed() {
//
//	}
}
