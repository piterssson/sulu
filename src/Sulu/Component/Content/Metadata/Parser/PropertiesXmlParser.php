<?php

/*
 * This file is part of Sulu.
 *
 * (c) MASSIVE ART WebServices GmbH
 *
 * This source file is subject to the MIT license that is bundled
 * with this source code in the file LICENSE.
 */

namespace Sulu\Component\Content\Metadata\Parser;

use Sulu\Component\Content\Metadata\BlockMetadata;
use Sulu\Component\Content\Metadata\ComponentMetadata;
use Sulu\Component\Content\Metadata\PropertyMetadata;
use Sulu\Component\Content\Metadata\SectionMetadata;
use Sulu\Component\Content\Metadata\XmlParserTrait;
use Symfony\Component\ExpressionLanguage\ExpressionLanguage;
use Symfony\Component\Translation\TranslatorInterface;

/**
 * Parse properties structure from an XML file.
 */
class PropertiesXmlParser
{
    use XmlParserTrait;

    /**
     * @var ExpressionLanguage
     */
    private $expressionLanguage;

    /**
     * @var TranslatorInterface
     */
    private $translator;

    /**
     * @var string[]
     */
    private $locales;

    public function __construct(ExpressionLanguage $expressionLanguage, TranslatorInterface $translator, array $locales)
    {
        $this->expressionLanguage = $expressionLanguage;
        $this->translator = $translator;
        $this->locales = array_keys($locales);
    }

    public function loadAndCreateProperties(
        $templateKey,
        $path,
        &$tags,
        \DOMXPath $xpath,
        \DOMNode $context = null
    ): array {
        $propertyData = $this->loadProperties($templateKey, $path, $tags, $xpath, $context);

        return $this->mapProperties($propertyData);
    }

    /**
     * load properties from given context.
     */
    private function loadProperties($templateKey, $path, &$tags, \DOMXPath $xpath, \DOMNode $context = null): array
    {
        $result = [];

        /** @var \DOMElement $node */
        foreach ($xpath->query($path, $context) as $node) {
            if ('property' === $node->tagName) {
                $value = $this->loadProperty($templateKey, $xpath, $node, $tags);
                $result[$value['name']] = $value;
            } elseif ('block' === $node->tagName) {
                $value = $this->loadBlock($templateKey, $xpath, $node, $tags);
                $result[$value['name']] = $value;
            } elseif ('section' === $node->tagName) {
                $value = $this->loadSection($templateKey, $xpath, $node, $tags);
                $result[$value['name']] = $value;
            }
        }

        return $result;
    }

    /**
     * load single property.
     */
    private function loadProperty($templateKey, \DOMXPath $xpath, \DOMNode $node, &$tags)
    {
        $result = $this->loadValues(
            $xpath,
            $node,
            [
                'name',
                'type',
                'minOccurs',
                'maxOccurs',
                'colspan',
                'cssClass',
                'size',
                'spaceAfter',
                'disabledCondition',
                'visibleCondition',
            ]
        );

        $result['mandatory'] = $this->getValueFromXPath('@mandatory', $xpath, $node, false);
        $result['multilingual'] = $this->getValueFromXPath('@multilingual', $xpath, $node, true);
        $result['onInvalid'] = $this->getValueFromXPath('@onInvalid', $xpath, $node);
        $result['tags'] = $this->loadTags('x:tag', $tags, $xpath, $node);
        $result['params'] = $this->loadParams('x:params/x:param', $xpath, $node);
        $result['meta'] = $this->loadMeta('x:meta', $xpath, $node);

        return $result;
    }

    /**
     * validates a single tag.
     */
    private function validateTag($tag, &$tags)
    {
        if (!isset($tags[$tag['name']])) {
            $tags[$tag['name']] = [];
        }

        $tags[$tag['name']][] = $tag['priority'];
    }

    /**
     * load single tag.
     */
    private function loadTag(\DOMXPath $xpath, \DOMNode $node)
    {
        $tag = [
            'name' => null,
            'priority' => null,
            'attributes' => [],
        ];

        foreach ($node->attributes as $key => $attr) {
            if (in_array($key, ['name', 'priority'])) {
                $tag[$key] = $attr->value;
            } else {
                $tag['attributes'][$key] = $attr->value;
            }
        }

        return $tag;
    }

    /**
     * load single block.
     */
    private function loadBlock($templateKey, \DOMXPath $xpath, \DOMNode $node, &$tags)
    {
        $result = $this->loadValues(
            $xpath,
            $node,
            [
                'name',
                'default-type',
                'minOccurs',
                'maxOccurs',
                'colspan',
                'cssClass',
                'disabledCondition',
                'visibleCondition',
            ]
        );

        $result['mandatory'] = $this->getValueFromXPath('@mandatory', $xpath, $node, false);
        $result['type'] = 'block';
        $result['tags'] = $this->loadTags('x:tag', $tags, $xpath, $node);
        $result['params'] = $this->loadParams('x:params/x:param', $xpath, $node);
        $result['meta'] = $this->loadMeta('x:meta', $xpath, $node);
        $result['types'] = $this->loadTypes($templateKey, 'x:types/x:type', $tags, $xpath, $node);

        return $result;
    }

    /**
     * load single block.
     */
    private function loadSection($templateKey, \DOMXPath $xpath, \DOMNode $node, &$tags)
    {
        $result = $this->loadValues(
            $xpath,
            $node,
            ['name', 'colspan', 'cssClass', 'disabledCondition', 'visibleCondition']
        );

        $result['type'] = 'section';
        $result['params'] = $this->loadParams('x:params/x:param', $xpath, $node);
        $result['meta'] = $this->loadMeta('x:meta', $xpath, $node);
        $result['properties'] = $this->loadProperties($templateKey, 'x:properties/x:*', $tags, $xpath, $node);

        return $result;
    }

    /**
     * load tags from given tag and validates them.
     */
    private function loadTags($path, &$tags, \DOMXPath $xpath, \DOMNode $context = null)
    {
        $result = [];

        /** @var \DOMElement $node */
        foreach ($xpath->query($path, $context) as $node) {
            $tag = $this->loadTag($xpath, $node);
            $this->validateTag($tag, $tags);

            $result[] = $tag;
        }

        return $result;
    }

    /**
     * load types from given node.
     */
    private function loadTypes($templateKey, $path, &$tags, \DOMXPath $xpath, \DOMNode $context = null)
    {
        $result = [];

        /** @var \DOMElement $node */
        foreach ($xpath->query($path, $context) as $node) {
            $value = $this->loadType($templateKey, $xpath, $node, $tags);
            $result[$value['name']] = $value;
        }

        return $result;
    }

    /**
     * load single param.
     */
    private function loadType($templateKey, \DOMXPath $xpath, \DOMNode $node, &$tags)
    {
        $result = $this->loadValues($xpath, $node, ['name']);

        $result['meta'] = $this->loadMeta('x:meta', $xpath, $node);
        $result['properties'] = $this->loadProperties($templateKey, 'x:properties/x:*', $tags, $xpath, $node);

        return $result;
    }

    /**
     * load values defined by key from given node.
     */
    private function loadValues(\DOMXPath $xpath, \DOMNode $node, $keys, $prefix = '@')
    {
        $result = [];

        foreach ($keys as $key) {
            $result[$key] = $this->getValueFromXPath($prefix . $key, $xpath, $node);
        }

        return $result;
    }

    private function loadMeta($path, \DOMXPath $xpath, \DOMNode $context = null)
    {
        $result = [];
        $metaNode = $xpath->query($path, $context)->item(0);

        if (!$metaNode) {
            return $result;
        }

        $result['title'] = $this->loadMetaTag('x:title', $xpath, $metaNode);
        $result['info_text'] = $this->loadMetaTag('x:info_text', $xpath, $metaNode);
        $result['placeholder'] = $this->loadMetaTag('x:placeholder', $xpath, $metaNode);

        return $result;
    }

    private function loadMetaTag($path, \DOMXPath $xpath, \DOMNode $context = null)
    {
        $result = [];

        $translationKey = null;

        /** @var \DOMElement $node */
        foreach ($xpath->query($path, $context) as $node) {
            $lang = $this->getValueFromXPath('@lang', $xpath, $node);

            if (!$lang) {
                $translationKey = $node->textContent;

                continue;
            }

            $result[$lang] = $node->textContent;
        }

        if (!$translationKey) {
            return $result;
        }

        $missingLocales = array_diff($this->locales, array_keys($result));
        foreach ($missingLocales as $missingLocale) {
            $result[$missingLocale] = $this->translator->trans($translationKey, [], 'admin', $missingLocale);
        }

        return $result;
    }

    /**
     * load params from given node.
     */
    private function loadParams($path, \DOMXPath $xpath, \DOMNode $context = null)
    {
        $result = [];

        /** @var \DOMElement $node */
        foreach ($xpath->query($path, $context) as $node) {
            $result[] = $this->loadParam($xpath, $node);
        }

        return $result;
    }

    /**
     * load single param.
     */
    private function loadParam(\DOMXPath $xpath, \DOMNode $node)
    {
        $result = [
            'name' => $this->getValueFromXPath('@name', $xpath, $node),
            'type' => $this->getValueFromXPath('@type', $xpath, $node, 'string'),
            'meta' => $this->loadMeta('x:meta', $xpath, $node),
        ];

        $expression = $this->getValueFromXPath('@expression', $xpath, $node);
        if ($expression) {
            $result['value'] = $this->expressionLanguage->evaluate($expression);

            return $result;
        }

        switch ($result['type']) {
            case 'collection':
                $result['value'] = $this->loadParams('x:param', $xpath, $node);
                break;
            default:
                $result['value'] = $this->getValueFromXPath('@value', $xpath, $node, 'string');
                break;
        }

        return $result;
    }

    private function mapProperties(array $data): array
    {
        $properties = [];
        foreach ($data as $propertyName => $dataProperty) {
            $property = $this->createProperty($propertyName, $dataProperty);

            if ($property) {
                $properties[] = $property;
            }
        }

        return $properties;
    }

    /**
     * @return null|BlockMetadata|PropertyMetadata|SectionMetadata
     */
    private function createProperty(string $propertyName, array $propertyData)
    {
        if ('block' === $propertyData['type']) {
            return $this->createBlock($propertyName, $propertyData);
        }

        if ('section' === $propertyData['type']) {
            return $this->createSection($propertyName, $propertyData);
        }

        $property = new PropertyMetadata();
        $property->setName($propertyName);
        $this->mapProperty($property, $propertyData);

        return $property;
    }

    private function createSection($propertyName, $data): SectionMetadata
    {
        $section = new SectionMetadata();
        $section->setName($propertyName);
        $section->setSize($data['colspan']);

        if (isset($data['meta']['title'])) {
            $section->setTitles($data['meta']['title']);
        }

        if (isset($data['meta']['info_text'])) {
            $section->setDescriptions($data['meta']['info_text']);
        }

        if (isset($data['disabledCondition'])) {
            $section->setDisabledCondition($data['disabledCondition']);
        }

        if (isset($data['visibleCondition'])) {
            $section->setVisibleCondition($data['visibleCondition']);
        }

        foreach ($data['properties'] as $name => $property) {
            $section->addChild($this->createProperty($name, $property));
        }

        return $section;
    }

    private function createBlock($propertyName, $data): BlockMetadata
    {
        $blockProperty = new BlockMetadata();
        $blockProperty->setName($propertyName);
        $blockProperty->defaultComponentName = $data['default-type'];

        if (isset($data['disabledCondition'])) {
            $blockProperty->setDisabledCondition($data['disabledCondition']);
        }

        if (isset($data['visibleCondition'])) {
            $blockProperty->setVisibleCondition($data['visibleCondition']);
        }

        if (isset($data['meta']['title'])) {
            $blockProperty->setTitles($data['meta']['title']);
        }

        if (isset($data['meta']['info_text'])) {
            $blockProperty->setDescriptions($data['meta']['info_text']);
        }

        $this->mapProperty($blockProperty, $data);

        foreach ($data['types'] as $name => $type) {
            $component = new ComponentMetadata();
            $component->setName($name);

            if (isset($type['meta']['title'])) {
                $component->setTitles($type['meta']['title']);
            }
            if (isset($data['meta']['info_text'])) {
                $component->setDescriptions($data['meta']['info_text']);
            }

            foreach ($type['properties'] as $propertyName => $propertyData) {
                $property = new PropertyMetadata();
                $property->setName($propertyName);
                $this->mapProperty($property, $propertyData);
                $component->addChild($property);
            }
            $blockProperty->addComponent($component);
        }

        return $blockProperty;
    }

    private function mapProperty(PropertyMetadata $property, $data): void
    {
        $data = $this->normalizePropertyData($data);
        $property->setType($data['type']);
        $property->setLocalized($data['multilingual']);
        $property->setRequired($data['mandatory']);
        $property->setColSpan($data['colspan']);
        $property->setSize($data['size']);
        $property->setSpaceAfter($data['spaceAfter']);
        $property->setCssClass($data['cssClass']);
        $property->setTags($data['tags']);
        $property->setMinOccurs(null !== $data['minOccurs'] ? intval($data['minOccurs']) : null);
        $property->setMaxOccurs(null !== $data['maxOccurs'] ? intval($data['maxOccurs']) : null);
        $property->setDisabledCondition(
            array_key_exists('disabledCondition', $data) ? $data['disabledCondition'] : null
        );
        $property->setVisibleCondition(
            array_key_exists('visibleCondition', $data) ? $data['visibleCondition'] : null
        );
        $property->setParameters($data['params']);
        $property->setOnInvalid(array_key_exists('onInvalid', $data) ? $data['onInvalid'] : null);
        $this->mapMeta($property, $data['meta']);
    }

    private function normalizePropertyData($data): array
    {
        $data = array_replace_recursive(
            [
                'type' => null,
                'multilingual' => true,
                'mandatory' => true,
                'colSpan' => null,
                'cssClass' => null,
                'minOccurs' => null,
                'maxOccurs' => null,
                'size' => null,
                'spaceAfter' => null,
            ],
            $this->normalizeItem($data)
        );

        return $data;
    }

    private function normalizeItem($data): array
    {
        $data = array_merge_recursive(
            [
                'meta' => [
                    'title' => [],
                    'info_text' => [],
                    'placeholders' => [],
                ],
                'params' => [],
                'tags' => [],
            ],
            $data
        );

        return $data;
    }

    private function mapMeta(PropertyMetadata $item, $meta): void
    {
        $item->setTitles($meta['title']);
        $item->setDescriptions($meta['info_text']);

        if ($item->getPlaceholders()) {
            $item->setPlaceholders($meta['info_text']);
        }
    }
}
