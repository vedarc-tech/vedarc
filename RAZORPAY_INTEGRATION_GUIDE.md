# Razorpay Payment Gateway Integration Guide

## 🚀 Complete Razorpay Integration for VEDARC Internship Platform

This guide covers the complete implementation of Razorpay payment gateway integration for the VEDARC Internship Platform registration process.

## 📋 Overview

The integration includes:
- **Backend Payment Processing**: Order creation, payment verification, webhook handling
- **Frontend Payment UI**: Secure payment modal with Razorpay checkout
- **Database Integration**: Payment tracking and user status management
- **Email Notifications**: Payment confirmation emails
- **Security**: Signature verification and secure payment handling

## 🔧 Backend Implementation

### 1. Dependencies Added
```bash
razorpay==1.4.1
```

### 2. Environment Variables
Add these to your `.env` file:
```env
# Razorpay Configuration
RAZORPAY_KEY_ID=rzp_test_YOUR_TEST_KEY_ID
RAZORPAY_KEY_SECRET=YOUR_TEST_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET=YOUR_WEBHOOK_SECRET
```

### 3. New API Endpoints

#### Registration with Payment (`POST /api/register`)
- Creates user account
- Generates Razorpay order
- Returns payment order details

#### Payment Verification (`POST /api/verify-payment`)
- Verifies payment signature
- Updates user status
- Sends confirmation email

#### Webhook Handler (`POST /api/razorpay-webhook`)
- Handles Razorpay webhook notifications
- Updates payment status automatically
- Processes payment.captured events

### 4. Database Changes

#### New Collection: `payments`
```javascript
{
  order_id: "order_xxx",
  user_id: "VEDARC-FE-001",
  amount: 999,
  currency: "INR",
  status: "created|completed|failed",
  user_data: {...},
  created_at: Date,
  payment_id: "pay_xxx",
  verified: false,
  verified_at: Date,
  webhook_received: false
}
```

#### Updated User Status Flow
1. **Registration**: `Payment Pending`
2. **Payment Success**: `Pending` (for HR approval)
3. **HR Approval**: `Active`

## 🎨 Frontend Implementation

### 1. Razorpay Script Loading
```javascript
useEffect(() => {
  const loadRazorpay = () => {
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => setRazorpayLoaded(true)
    document.body.appendChild(script)
  }
  loadRazorpay()
}, [])
```

### 2. Payment Flow
1. **Registration Form** → User fills details
2. **Backend Registration** → Creates user + payment order
3. **Payment Modal** → Shows payment details
4. **Razorpay Checkout** → Secure payment processing
5. **Payment Verification** → Backend verifies payment
6. **Success Page** → Shows confirmation

### 3. Payment Modal Features
- **Amount Display**: ₹999 for internship
- **Security Badge**: Razorpay security indicator
- **User ID Display**: Shows generated user ID
- **Payment Details**: Course information
- **Error Handling**: Graceful error display

## 🔒 Security Features

### 1. Payment Verification
```python
def verify_payment(payment_id, order_id, signature):
    params_dict = {
        'razorpay_payment_id': payment_id,
        'razorpay_order_id': order_id,
        'razorpay_signature': signature
    }
    razorpay_client.utility.verify_payment_signature(params_dict)
```

### 2. Webhook Signature Verification
```python
def verify_razorpay_signature(payload, signature):
    razorpay_client.utility.verify_webhook_signature(
        payload, signature, RAZORPAY_WEBHOOK_SECRET
    )
```

### 3. Database Security
- Payment records stored with user data
- Payment status tracking
- Audit trail for all transactions

## 📧 Email Notifications

### Payment Confirmation Email
```
Subject: Payment Successful - VEDARC Internship

Dear [Student Name],

Your payment of ₹999 for the VEDARC Internship Program has been successfully processed.

Payment Details:
- Payment ID: pay_xxx
- Order ID: order_xxx
- Amount: ₹999
- User ID: VEDARC-FE-001

Your account is now pending HR approval. You will receive login credentials via WhatsApp once approved.

Thank you for choosing VEDARC Technologies!

Best regards,
VEDARC Team
```

## 🚀 Deployment Configuration

### Render Deployment
```yaml
envVars:
  - key: RAZORPAY_KEY_ID
    value: rzp_test_YOUR_TEST_KEY_ID
  - key: RAZORPAY_KEY_SECRET
    sync: false  # Set in Render dashboard
  - key: RAZORPAY_WEBHOOK_SECRET
    sync: false  # Set in Render dashboard
```

### Webhook URL Configuration
Set webhook URL in Razorpay dashboard:
```
https://your-backend-url.com/api/razorpay-webhook
```

## 🧪 Testing

### Test Card Details
```
Card Number: 4111 1111 1111 1111
Expiry: Any future date
CVV: Any 3 digits
Name: Any name
```

### Test UPI
```
UPI ID: success@razorpay
```

## 📊 Payment Flow Diagram

```
User Registration
       ↓
   Backend API
       ↓
  Create User + Order
       ↓
   Payment Modal
       ↓
  Razorpay Checkout
       ↓
   Payment Success
       ↓
  Verify Payment
       ↓
  Update User Status
       ↓
  Send Email + Success
```

## 🔧 Configuration Steps

### 1. Razorpay Account Setup
1. Create Razorpay account
2. Get API keys from dashboard
3. Configure webhook URL
4. Set webhook secret

### 2. Environment Setup
1. Add Razorpay keys to `.env`
2. Update deployment configuration
3. Set webhook URL in Razorpay dashboard

### 3. Testing
1. Use test mode for development
2. Test with test cards
3. Verify webhook handling
4. Check email notifications

## 🚨 Important Notes

### Security
- Never expose API secrets in frontend
- Always verify payment signatures
- Use HTTPS in production
- Validate all payment data

### Error Handling
- Handle payment failures gracefully
- Provide clear error messages
- Log all payment attempts
- Implement retry mechanisms

### Production Checklist
- [ ] Switch to live Razorpay keys
- [ ] Configure production webhook URL
- [ ] Test with real payment methods
- [ ] Monitor payment success rates
- [ ] Set up payment analytics
- [ ] Configure email templates

## 📞 Support

For Razorpay integration issues:
1. Check Razorpay documentation
2. Verify API key configuration
3. Test webhook connectivity
4. Review payment logs
5. Contact Razorpay support if needed

## 🎯 Benefits

- **Secure Payments**: PCI DSS compliant
- **Multiple Payment Methods**: Cards, UPI, NetBanking
- **Real-time Processing**: Instant payment verification
- **Automated Workflow**: No manual intervention needed
- **Audit Trail**: Complete payment history
- **User Experience**: Seamless payment flow

This integration provides a complete, secure, and user-friendly payment experience for the VEDARC Internship Platform registration process. 