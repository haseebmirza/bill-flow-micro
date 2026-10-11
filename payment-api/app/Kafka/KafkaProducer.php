<?php

namespace App\Kafka;

use Illuminate\Support\Facades\Log;
use longlang\phpkafka\Producer\Producer;
use longlang\phpkafka\Producer\ProducerConfig;

class KafkaProducer
{
    private ?Producer $producer = null;

    public function publish(string $topic, array $payload): void
    {
        try {
            $producer = $this->getProducer();
            if (!$producer) {
                return;
            }

            $producer->send($topic, json_encode($payload));

            Log::info('kafka_event_published', [
                'topic' => $topic,
                'event_type' => $payload['event_type'] ?? 'unknown',
                'event_id' => $payload['event_id'] ?? null,
            ]);
        } catch (\Exception $e) {
            Log::error('kafka_publish_failed', [
                'topic' => $topic,
                'error' => $e->getMessage(),
            ]);
        }
    }

    private function getProducer(): ?Producer
    {
        if ($this->producer) {
            return $this->producer;
        }

        try {
            $config = new ProducerConfig();
            $config->setBootstrapServer(config('services.kafka.bootstrap_servers', 'localhost:9092'));
            $config->setAcks(-1);

            $this->producer = new Producer($config);
            return $this->producer;
        } catch (\Exception $e) {
            Log::warning('kafka_connection_failed', ['error' => $e->getMessage()]);
            return null;
        }
    }

    public function __destruct()
    {
        if ($this->producer) {
            $this->producer->close();
        }
    }
}
