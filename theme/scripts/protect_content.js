/* Copyright (c) 2013 Sean Stewart
 *
 * Decrypts content encrypted by the associated pelican plugin.
 */

(function () {
    var strip_padding = function (padded_content, padding_char) {
        var i;
        
        for (i = padded_content.length; i > 0; i--) {
            if (padded_content[i - 1] !== padding_char) {
                return padded_content.slice(0, i);
            }
        }
    };

    var decrypt_content = function (password, iv_b64, ciphertext_b64, padding_char) {
        var key = CryptoJS.MD5(password),
            iv = CryptoJS.enc.Base64.parse(iv_b64),
            ciphertext = CryptoJS.enc.Base64.parse(ciphertext_b64);

        var encrypted = {
            key: key,
            iv: iv,
            ciphertext: ciphertext
        };

        var plaintext = CryptoJS.AES.decrypt(encrypted, key, {iv: iv, padding: CryptoJS.pad.NoPadding });

        try {
            return strip_padding(plaintext.toString(CryptoJS.enc.Utf8), padding_char);
        }
        catch (err) {
            // encoding failed; wrong password
            return false;
        }
    };

    var init_decryptor = function() {
        var unlock_btn = document.getElementById('unlock-content');
        
        if (unlock_btn) {
            var password_input = document.getElementById('content-password'),
                encrypted_content = document.getElementById('encrypted-content'), 
                decrypted_content = document.getElementById('decrypted-content'),
                unlock_form = document.getElementById('unlock-form');
            
            unlock_btn.addEventListener('click', function () {
                var parts = encrypted_content.innerHTML.split(';');

                var content = decrypt_content(
                    password_input.value,
                    parts[0],
                    parts[1],
                    parts[2]
                 );
                
                 if (content) {
                    decrypted_content.innerHTML = content;
                    unlock_form.parentNode.removeChild(unlock_form);
                    encrypted_content.parentNode.removeChild(encrypted_content);
                 }
                 else {
                    password_input.value = '';
                 }
            });
        }
    };

    document.addEventListener('DOMContentLoaded', init_decryptor);
})();
