package paynexa

import (
	"context"
	"encoding/json"
	"fmt"
)

type PaymentService struct {
	client *Client
}

type PaymentIntent struct {
	ID                  string                 `json:"id"`
	MerchantID          string                 `json:"merchantId"`
	CustomerID          string                 `json:"customerId,omitempty"`
	AmountCents         int64                  `json:"amountCents"`
	Currency            string                 `json:"currency"`
	FeeCents            int64                  `json:"feeCents"`
	NetAmountCents      int64                  `json:"netAmountCents"`
	Status              string                 `json:"status"`
	PaymentMethodType   string                 `json:"paymentMethodType,omitempty"`
	Description         string                 `json:"description,omitempty"`
	ClientSecret        string                 `json:"clientSecret"`
	RiskScore           int                    `json:"riskScore,omitempty"`
	RiskDecision        string                 `json:"riskDecision,omitempty"`
	Metadata            map[string]interface{} `json:"metadata,omitempty"`
	CreatedAt           string                 `json:"createdAt"`
	CapturedAt          string                 `json:"capturedAt,omitempty"`
}

type CreatePaymentIntentParams struct {
	AmountCents         int64                  `json:"amountCents"`
	Currency            string                 `json:"currency"`
	CustomerID          string                 `json:"customerId,omitempty"`
	Description         string                 `json:"description,omitempty"`
	StatementDescriptor string                 `json:"statementDescriptor,omitempty"`
	ReceiptEmail        string                 `json:"receiptEmail,omitempty"`
	IdempotencyKey      string                 `json:"-"`
	Metadata            map[string]interface{} `json:"metadata,omitempty"`
}

type ConfirmCardParams struct {
	CardNumber string `json:"cardNumber"`
	ExpMonth   int    `json:"expMonth"`
	ExpYear    int    `json:"expYear"`
	CVV        string `json:"cvv"`
	HolderName string `json:"holderName"`
}

type ConfirmPaymentParams struct {
	PaymentMethodType string             `json:"paymentMethodType"`
	Card              *ConfirmCardParams `json:"card,omitempty"`
	DeviceFingerprint string             `json:"deviceFingerprint,omitempty"`
}

func (s *PaymentService) Create(ctx context.Context, params CreatePaymentIntentParams) (*PaymentIntent, error) {
	headers := make(map[string]string)
	if params.IdempotencyKey != "" {
		headers["Idempotency-Key"] = params.IdempotencyKey
	}

	data, err := s.client.Do(ctx, "POST", "/payments/intents", params, headers)
	if err != nil {
		return nil, err
	}

	var intent PaymentIntent
	if err := json.Unmarshal(data, &intent); err != nil {
		return nil, fmt.Errorf("failed to decode payment intent: %w", err)
	}

	return &intent, nil
}

func (s *PaymentService) Get(ctx context.Context, id string) (*PaymentIntent, error) {
	data, err := s.client.Do(ctx, "GET", fmt.Sprintf("/payments/intents/%s", id), nil, nil)
	if err != nil {
		return nil, err
	}

	var intent PaymentIntent
	if err := json.Unmarshal(data, &intent); err != nil {
		return nil, fmt.Errorf("failed to decode payment intent: %w", err)
	}

	return &intent, nil
}

func (s *PaymentService) Confirm(ctx context.Context, id string, params ConfirmPaymentParams) (*PaymentIntent, error) {
	data, err := s.client.Do(ctx, "POST", fmt.Sprintf("/payments/intents/%s/confirm", id), params, nil)
	if err != nil {
		return nil, err
	}

	var intent PaymentIntent
	if err := json.Unmarshal(data, &intent); err != nil {
		return nil, fmt.Errorf("failed to decode confirmed payment intent: %w", err)
	}

	return &intent, nil
}

func (s *PaymentService) Verify3DS(ctx context.Context, id string, otpCode string) (*PaymentIntent, error) {
	payload := map[string]string{"otpCode": otpCode}
	data, err := s.client.Do(ctx, "POST", fmt.Sprintf("/payments/intents/%s/verify-3ds", id), payload, nil)
	if err != nil {
		return nil, err
	}

	var intent PaymentIntent
	if err := json.Unmarshal(data, &intent); err != nil {
		return nil, fmt.Errorf("failed to decode 3ds verified intent: %w", err)
	}

	return &intent, nil
}
