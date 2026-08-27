package paynexa

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"time"
)

type Config struct {
	APIKey     string
	BaseURL    string
	HTTPClient *http.Client
	Timeout    time.Duration
}

type Client struct {
	config        Config
	Payments      *PaymentService
	Cards         *CardService
	Ledger        *LedgerService
	Webhooks      *WebhookService
	Disputes      *DisputeService
	Subscriptions *SubscriptionService
}

type APIResponse struct {
	Success bool            `json:"success"`
	Data    json.RawMessage `json:"data,omitempty"`
	Error   *APIError       `json:"error,omitempty"`
}

type APIError struct {
	Code      string `json:"code"`
	Message   string `json:"message"`
	RequestID string `json:"requestId,omitempty"`
}

func (e *APIError) Error() string {
	return fmt.Sprintf("PayNexa API Error [%s]: %s", e.Code, e.Message)
}

func NewClient(apiKey string, opts ...func(*Config)) *Client {
	cfg := Config{
		APIKey:     apiKey,
		BaseURL:    "http://localhost:4000/api/v1",
		HTTPClient: &http.Client{Timeout: 30 * time.Second},
		Timeout:    30 * time.Second,
	}

	for _, opt := range opts {
		opt(&cfg)
	}

	c := &Client{config: cfg}
	c.Payments = &PaymentService{client: c}
	c.Cards = &CardService{client: c}
	c.Ledger = &LedgerService{client: c}
	c.Webhooks = &WebhookService{client: c}
	c.Disputes = &DisputeService{client: c}
	c.Subscriptions = &SubscriptionService{client: c}

	return c
}

func WithBaseURL(url string) func(*Config) {
	return func(c *Config) {
		c.BaseURL = strings.TrimRight(url, "/")
	}
}

func (c *Client) Do(ctx context.Context, method, path string, body interface{}, headers map[string]string) ([]byte, error) {
	var bodyReader io.Reader
	if body != nil {
		jsonBytes, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal request payload: %w", err)
		}
		bodyReader = bytes.NewReader(jsonBytes)
	}

	reqURL := fmt.Sprintf("%s%s", c.config.BaseURL, path)
	req, err := http.NewRequestWithContext(ctx, method, reqURL, bodyReader)
	if err != nil {
		return nil, fmt.Errorf("failed to create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Authorization", fmt.Sprintf("Bearer %s", c.config.APIKey))
	req.Header.Set("User-Agent", "PayNexa-Go-SDK/1.0.0")

	for k, v := range headers {
		req.Header.Set(k, v)
	}

	resp, err := c.config.HTTPClient.Do(req)
	if err != nil {
		return nil, fmt.Errorf("HTTP request failed: %w", err)
	}
	defer resp.Body.Close()

	respBytes, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, fmt.Errorf("failed to read response body: %w", err)
	}

	var apiResp APIResponse
	if err := json.Unmarshal(respBytes, &apiResp); err != nil {
		return nil, fmt.Errorf("invalid API response format: %w", err)
	}

	if !apiResp.Success {
		if apiResp.Error != nil {
			return nil, apiResp.Error
		}
		return nil, fmt.Errorf("request failed with status %d", resp.StatusCode)
	}

	return apiResp.Data, nil
}
