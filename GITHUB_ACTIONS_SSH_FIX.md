# GitHub Actions SSH Key Fix

## Issues Identified

The GitHub Actions workflow was failing with these errors:
1. `Error loading key "(stdin)": error in libcrypto`
2. `Load key "/home/runner/.ssh/id_rsa": error in libcrypto`
3. `Permission denied (publickey)`

## Root Causes

This error typically occurs due to one or more of the following issues with the SSH private key:

1. **Missing Newline at End**: The private key must end with a newline character after `-----END OPENSSH PRIVATE KEY-----`
2. **Carriage Return Characters**: Windows-style line endings (`\r\n`) can cause issues
3. **Improper Formatting**: Extra spaces, missing headers/footers, or corrupted key data
4. **Wrong Key Type**: Using public key instead of private key (though this is less likely)

## Solution Applied

The workflow has been updated to:

1. **Use environment variable** for SSH key (more reliable for multiline secrets)
2. **Clean the key** by removing carriage return characters (`\r`)
3. **Ensure proper formatting** by adding a trailing newline
4. **Set correct permissions** (600 for private key, 700 for .ssh directory)
5. **Validate key format** before use with detailed error messages
6. **Explicitly specify key file** in SSH commands with `-i ~/.ssh/id_rsa`
7. **Use `IdentitiesOnly=yes`** to ensure only the specified key is used
8. **Add connection testing** before deployment
9. **Clean up the key** after deployment for security

## How to Fix Your GitHub Secret

If the issue persists, verify your `DROPLET_SSH_KEY` secret in GitHub:

### Steps to Fix:

1. **Get your private key** from your local machine:
   ```bash
   cat ~/.ssh/id_rsa
   # or
   cat ~/.ssh/id_ed25519
   ```

2. **Verify the key format locally first**:
   ```bash
   # Test if your key is valid
   ssh-keygen -l -f ~/.ssh/id_rsa
   # This should show the key fingerprint without errors
   ```

3. **Check the key format**:
   - Should start with: `-----BEGIN OPENSSH PRIVATE KEY-----` or `-----BEGIN RSA PRIVATE KEY-----`
   - Should end with: `-----END OPENSSH PRIVATE KEY-----` or `-----END RSA PRIVATE KEY-----`
   - Should have a newline after the ending line
   - **IMPORTANT**: Make sure you're copying the PRIVATE key, not the public key (public keys start with `ssh-rsa` or `ssh-ed25519`)

4. **Copy the entire key** including:
   - The BEGIN line (with dashes)
   - All key data lines (usually many lines)
   - The END line (with dashes)
   - **Press Enter after the END line** to add a trailing newline

5. **Update the secret in GitHub**:
   - Go to: Repository → Settings → Secrets and variables → Actions
   - Edit `DROPLET_SSH_KEY`
   - **Delete the old value completely**
   - Paste the key exactly as copied (including BEGIN and END lines)
   - Make sure there's a newline at the end (cursor should be on a new line after `-----END...-----`)
   - Save

6. **Verify the public key is on the server**:
   ```bash
   # On your server, check if the public key is in authorized_keys
   ssh root@your-server
   cat ~/.ssh/authorized_keys
   # Your public key should be listed there
   
   # If not, add it:
   # On your local machine:
   cat ~/.ssh/id_rsa.pub
   # Copy the output, then on server:
   echo "paste-public-key-here" >> ~/.ssh/authorized_keys
   chmod 600 ~/.ssh/authorized_keys
   ```

### Alternative: Convert Key to PEM Format

If you're using OpenSSH format and having issues, you can convert to PEM:

```bash
# Convert OpenSSH key to PEM format
ssh-keygen -p -f ~/.ssh/id_rsa -m pem

# Then copy the converted key to GitHub secrets
cat ~/.ssh/id_rsa
```

## Workflow Changes

### Before:
- Used `webfactory/ssh-agent@v0.9.0` directly with secret
- No key validation or cleaning
- No connection testing

### After:
- Environment variable-based SSH key setup with cleaning
- Key format validation with detailed error messages
- Explicit key file specification in SSH commands
- Connection testing before deployment
- Proper cleanup after deployment

## Testing

After updating the secret and workflow:

1. Push to the `main` branch or manually trigger the workflow
2. Check the workflow logs for:
   - ✅ "SSH key format verification" (if successful)
   - ✅ "SSH connection successful"
   - ✅ "Deployment completed successfully!"

## Additional Notes

- The workflow now uses `StrictHostKeyChecking=no` to avoid host key verification issues
- SSH keys are cleaned up after deployment for security
- The workflow explicitly uses `-i ~/.ssh/id_rsa` and `IdentitiesOnly=yes` to ensure the correct key is used
- If you're still getting "Permission denied (publickey)", verify that:
  1. The public key corresponding to your private key is in `~/.ssh/authorized_keys` on the server
  2. The server's `~/.ssh` directory has correct permissions (700)
  3. The `authorized_keys` file has correct permissions (600)
  4. You're using the correct username (root in this case)

## Debugging Commands

If the workflow still fails, check the workflow logs for:
- Key fingerprint output (proves the key is valid)
- File size and permissions information
- First/last lines of the key file

You can also test the key locally:
```bash
# Test SSH connection with your key
ssh -i ~/.ssh/id_rsa -v root@your-server-ip
# The -v flag shows verbose output for debugging
```

