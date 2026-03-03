import { alert } from "../alertsAndLogs/alerts";
import { buildUrlQuery } from "../workingTools/urlOps";

/**
 * Delegated OAuth click handler.
 */
document.addEventListener('click', (event) => {
  const trigger = event.target?.closest?.('#lcs_oauth_hardpoint');
  if (!trigger) return;

  const uxMode = trigger.dataset.ux_mode || 'popup';

  let popup = null;

  // 🔥 Open immediately in the trusted gesture
  if (uxMode === 'popup') {

    const width = 680;
    const height = 700;

    // Multi-monitor safe offsets
    const screenX = typeof window.screenX !== 'undefined'
      ? window.screenX
      : (window.screenLeft ?? 0);

    const screenY = typeof window.screenY !== 'undefined'
      ? window.screenY
      : (window.screenTop ?? 0);

    // Use OUTER dimensions (not inner)
    const outerWidth = window.outerWidth
      || document.documentElement.clientWidth
      || screen.width;

    const outerHeight = window.outerHeight
      || document.documentElement.clientHeight
      || screen.height;

    // Proper centering + clamp + integer
    const left = Math.max(0, Math.round(screenX + (outerWidth - width) / 2));
    const top  = Math.max(0, Math.round(screenY + (outerHeight - height) / 2));

    popup = window.open(
      'about:blank',
      '_blank',
      `width=${width},height=${height},top=${top},left=${left},resizable=yes,scrollbars=yes`
    );

    if (!popup) {
      alert.send('Popup blocked! Please allow popups for this site.', 'error');
      return;
    }
  }

  launchOAuth({
    clientId: trigger.dataset.client_id,
    context: trigger.dataset.context,
    uxMode,
    popup
  });
});

/**
 * Launch OAuth flow.
 *
 * @param {Object} configs
 * @param {string} configs.clientId
 * @param {string} [configs.context]
 * @param {string} [configs.uxMode="popup"]
 * @param {Window|null} [configs.popup] - Pre-opened popup instance
 *
 * @example
 * launchOAuth({ clientId: 'abc123', popup });
 */
function launchOAuth(configs = {}) {
  const ORIGIN = 'https://lcs.ng/oauth';

  if (!configs.clientId) {
    alert.send('OAuth clientId is required.', 'error');
    if (configs.popup) configs.popup.close();
    return;
  }

  const query = buildUrlQuery({
    client_id: configs.clientId,
    context: configs.context,
    ux_mode: configs.uxMode || 'popup'
  });

  const finalUrl = ORIGIN + query;

  if ((configs.uxMode || 'popup') === 'popup') {

    const popup = configs.popup;

    if (!popup) return;

    popup.location.href = finalUrl;
    popup.focus();
    return;
  }

  window.location.href = finalUrl;
}