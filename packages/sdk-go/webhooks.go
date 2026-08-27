package paynexa

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"errors"
	"fmt"
	"math"
	"strconv"
	"strings"
	"time"
)

type WebhookService struct {
	client *Client
}

type WebhookEvent struct {
	ID         string                 `json:"id"`
	Type       string                 `json:"type"`
	APIVersion string                 `json:"apiVersion"`
	Data       map[string]interface{} `json:"data"`
	CreatedAt  string                 `json:"createdAt"`
}

// ConstructEvent verifies incoming webhook HMAC-SHA256 signature against header and payload
func (s *WebhookService) ConstructEvent(payload []byte, sigHeader, secret string, tolerance time.Duration) (*WebhookEvent, error) {
	if sigHeader == "" {
		return nil, errors.New("empty webhook signature header")
	}

	parts := strings.Split(sigHeader, ",")
	var timestampStr, signatureStr string

	for _, part := range parts {
		if strings.HasPrefix(part, "t=") {
			timestampStr = strings.TrimPrefix(part, "t=")
		} else if strings.HasPrefix(part, "v1=") {
			signatureStr = strings.TrimPrefix(part, "v1=")
		}
	}

	if timestampStr == "" || signatureStr == "" {
		return nil, errors.New("malformed webhook signature header")
	}

	timestampInt, err := strconv.ParseInt(timestampStr, 10, 64)
	if err != nil {
		return nil, fmt.Errorf("invalid timestamp format: %w", err)
	}

	now := time.Now().Unix()
	if tolerance > 0 && math.Abs(float64(now-timestampInt)) > tolerance.Seconds() {
		return nil, errors.New("webhook signature timestamp outside tolerance window")
	}

	signedPayload := fmt.Sprintf("%s.%s", timestampStr, string(payload))
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(signedPayload))
	expectedSig := hex.EncodeToString(mac.Sum(nil))

	if !hmac.Equal([]byte(signatureStr), []byte(expectedSig)) {
		return nil, errors.New("invalid webhook signature")
	}

	return nil, nil
}
